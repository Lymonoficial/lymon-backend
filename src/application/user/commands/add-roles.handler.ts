import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddRolesCommand } from './add-roles.command';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@/domain/user/repositories/user.repository';
import { RoleAssignment } from '@/domain/user/entities/user.entity';
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
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AUDIT_LOG_EVENT,
  AuditLoggedEvent,
} from '@/infrastructure/audit/events/audit-logged.event';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';

@CommandHandler(AddRolesCommand)
export class AddRolesHandler implements ICommandHandler<AddRolesCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: AddRolesCommand): Promise<void> {
    const user = await this.userRepository.findById({
      toString: () => command.userId,
    } as any);
    if (!user) throw new NotFoundException('User not found');

    if (!command.roleAssignments || command.roleAssignments.length === 0) {
      throw new BadRequestException('roleAssignments required');
    }

    await this.validateRoleAssignments(
      command.roleAssignments,
      user.getTenantId().toString(),
    );

    const before = { roleAssignments: user.getRoleAssignments() };

    const existing = user.getRoleAssignments();
    for (const a of command.roleAssignments) {
      const exists = existing.some(
        (e) =>
          e.roleId === a.roleId &&
          JSON.stringify(e.scope) === JSON.stringify(a.scope),
      );
      if (!exists) existing.push(a);
    }

    user.updateRoleAssignments(existing);
    await this.userRepository.save(user);

    const after = { roleAssignments: user.getRoleAssignments() };

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId ?? user.getTenantId().toString(),
        command.actorId ?? '',
        command.actorEmail ?? '',
        AuditAction.USER_UPDATED,
        AuditEntityType.USER,
        user.getId()?.toString(),
        { before, after },
      ),
    );
  }

  private async validateRoleAssignments(
    assignments: RoleAssignment[],
    tenantId: string,
  ) {
    let validPropertyIds: Set<string> | null = null;
    let validUnitIds: Set<string> | null = null;

    for (const assignment of assignments) {
      const roleId = RoleId.createFromString(assignment.roleId);
      const role = await this.roleRepository.findById(roleId);
      if (!role)
        throw new BadRequestException(
          `Role '${assignment.roleId}' does not exist`,
        );

      if (assignment.scope.type === 'PROPERTY') {
        if (!validPropertyIds) {
          const tid = TenantId.createFromString(tenantId);
          const properties = await this.propertyRepository.findByTenantId(tid);
          validPropertyIds = new Set(
            properties.map((p) => p.getId()!.toString()),
          );
        }
        const invalid = assignment.scope.resourceIds.filter(
          (id: string) => !validPropertyIds!.has(id),
        );
        if (invalid.length)
          throw new BadRequestException(
            `Property IDs not found: ${invalid.join(',')}`,
          );
      }

      if (assignment.scope.type === 'UNIT') {
        if (!validUnitIds) {
          const tid = TenantId.createFromString(tenantId);
          const units = await this.unitRepository.findByTenantId(tid);
          validUnitIds = new Set(units.map((u) => u.getId()!.toString()));
        }
        const invalid = assignment.scope.resourceIds.filter(
          (id: string) => !validUnitIds!.has(id),
        );
        if (invalid.length)
          throw new BadRequestException(
            `Unit IDs not found: ${invalid.join(',')}`,
          );
      }
    }
  }
}
