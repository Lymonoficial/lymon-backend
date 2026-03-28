import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InviteStaffCommand } from './invite-staff.command';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@/domain/user/repositories/user.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { Email } from '@/domain/shared/value-objects/email.vo';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '@/domain/tenant/repositories/tenant.repository';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import {
  UNIT_REPOSITORY,
  type UnitRepository,
} from '@/domain/unit/repositories/unit.repository';
import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from '@/domain/role/repositories/role.repository';
import { RoleId } from '@/domain/role/entities/role.entity';
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '@/application/auth/services/password-hasher.service';
import { RoleAssignment, User } from '@/domain/user/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';

@CommandHandler(InviteStaffCommand)
export class InviteStaffHandler implements ICommandHandler<InviteStaffCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: InviteStaffCommand): Promise<void> {
    const tenantId = TenantId.createFromString(command.tenantId);

    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (!command.roleAssignments || command.roleAssignments.length === 0) {
      throw new BadRequestException('At least one role assignment is required');
    }

    const existingUser = await this.userRepository.findByEmailAndTenantId(
      Email.create(command.email),
      tenantId,
    );
    if (existingUser) {
      throw new BadRequestException('User is already a member of this tenant.');
    }

    await this.validatePlanLimits(tenantId, tenant.getPlan().getStaffLimit());
    await this.validateRoleAssignments(
      command.roleAssignments,
      tenantId.toString(),
    );

    const passwordHash = await this.passwordHasher.hash(command.password);
    const staffUser = User.createStaff(
      Email.create(command.email),
      passwordHash,
      tenantId,
      command.roleAssignments,
    );
    await this.userRepository.save(staffUser);

    const savedStaff = await this.userRepository.findByEmailAndTenantId(
      Email.create(command.email),
      tenantId,
    );
    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.USER_INVITED,
        AuditEntityType.USER,
        savedStaff?.getId()?.toString(),
        { invitedEmail: command.email },
      ),
    );
  }

  /**
   * Validates that every roleId exists (system or tenant) and
   * every resourceId in each scope actually belongs to this tenant.
   */
  private async validateRoleAssignments(
    assignments: RoleAssignment[],
    tenantId: string,
  ): Promise<void> {
    // Cache property and unit IDs per tenant
    let validPropertyIds: Set<string> | null = null;
    let validUnitIds: Set<string> | null = null;

    for (const assignment of assignments) {
      // Validate roleId exists (system roles only)
      const roleId = RoleId.createFromString(assignment.roleId);
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new BadRequestException(
          `Role '${assignment.roleId}' does not exist`,
        );
      }

      // Validate scope resources
      if (assignment.scope.type === 'PROPERTY') {
        if (!validPropertyIds) {
          const tid = TenantId.createFromString(tenantId);
          const properties = await this.propertyRepository.findByTenantId(tid);
          validPropertyIds = new Set(
            properties.map((property) => property.getId()!.toString()),
          );
        }
        const invalid = assignment.scope.resourceIds.filter(
          (id) => !validPropertyIds!.has(id),
        );
        if (invalid.length > 0) {
          throw new BadRequestException(
            `Property IDs not found in this tenant: ${invalid.join(', ')}`,
          );
        }
      }

      if (assignment.scope.type === 'UNIT') {
        if (!validUnitIds) {
          const tid = TenantId.createFromString(tenantId);
          const units = await this.unitRepository.findByTenantId(tid);
          validUnitIds = new Set(units.map((unit) => unit.getId()!.toString()));
        }
        const invalid = assignment.scope.resourceIds.filter(
          (id) => !validUnitIds!.has(id),
        );
        if (invalid.length > 0) {
          throw new BadRequestException(
            `Unit IDs not found in this tenant: ${invalid.join(', ')}`,
          );
        }
      }
    }
  }

  private async validatePlanLimits(tenantId: TenantId, staffLimit: number) {
    const existingUsers = await this.userRepository.findByTenantId(tenantId);
    const staffCount = existingUsers.filter((u) => !u.isOwner()).length;
    if (staffCount >= staffLimit) {
      throw new ForbiddenException(
        `Plan limit reached. Your current plan allows ${staffLimit} staff members. Please upgrade your plan`,
      );
    }
  }
}
