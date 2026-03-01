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
import { Email } from '@/domain/tenant/value-objects/email.vo';
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
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '@/application/auth/services/password-hasher.service';
import { User, UserRoleEnum } from '@/domain/user/entities/user.entity';

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
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(command: InviteStaffCommand): Promise<any> {
    //     Verify the executor is OWNER or ADMIN (guard their tenantId matches).
    // Check the user doesn't already exist in this tenant (findByEmailAndTenantId).
    const tenantId = TenantId.createFromString(command.tenantId);

    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    if (command.role === UserRoleEnum.OWNER) {
      throw new BadRequestException('Cannot assign OWNER role to a staff member');
    }

    const existingUser = await this.userRepository.findByEmailAndTenantId(
      Email.create(command.email),
      tenantId,
    );

    if (existingUser)
      throw new BadRequestException('User is already member of this tenant.');

    // Check the tenant hasn't exceeded the plan's user limit (LymonOne = 2, LymonPlus = 10, LymonPrime = unlimited) — query findByTenantId and count.
    await this.validatePlanLimits(tenantId, tenant.getPlan().getStaffLimit());
    // If scope is PROPERTY or UNIT, validate that the given resourceIds actually belong to this tenant.
    if (command.scope.type !== 'TENANT') {
      await this.validateScopeResources(
        tenantId,
        command.scope.type,
        command.scope.resourceIds,
      );
    }
    // Generate a temporary password (or send an invite link via email).
    const passwordHash = await this.passwordHasher.hash(command.password);
    // User.createStaff(...) and save.
    const staffUser = User.createStaff(
      Email.create(command.email),
      passwordHash,
      tenantId,
      command.role,
      command.scope,
    );
    await this.userRepository.save(staffUser);
  }

  private async validateScopeResources(
    tenantId: TenantId,
    scopeType: 'PROPERTY' | 'UNIT',
    resourceIds: string[],
  ): Promise<void> {
    if (scopeType === 'PROPERTY') {
      const properties = await this.propertyRepository.findByTenantId(tenantId);
      const validIds = new Set(
        properties.map((property) => property.getId()!.toString()),
      );
      const invalid = resourceIds.filter((id) => !validIds.has(id));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `The following property IDs do not belong to this tenant: ${invalid.join(', ')}`,
        );
      }
    }

    if (scopeType === 'UNIT') {
      const units = await this.unitRepository.findByTenantId(tenantId);
      const validIds = new Set(units.map((unit) => unit.getId()!.toString()));
      const invalid = resourceIds.filter((id) => !validIds.has(id));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `The following unit IDs do not belong to this tenant: ${invalid.join(', ')}`,
        );
      }
    }
  }

  private async validatePlanLimits(tenantId: TenantId, staffLimit: number) {
    const existingUsersInTenant =
      await this.userRepository.findByTenantId(tenantId);
    const staffCount = existingUsersInTenant.filter(
      (user) => !user.isOwner(),
    ).length;

    if (staffCount >= staffLimit)
      throw new ForbiddenException(
        `Plan limit reached. Your current plan allows ${staffLimit} members. Please upgrade your plan`,
      );
  }
}
