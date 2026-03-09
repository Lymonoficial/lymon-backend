import { UpdateTenantProfileCommand } from '@/application/tenant/commands/update-tenant-profile.command';
import { UpdateTenantProfileResult } from '@/application/tenant/commands/update-tenant-profile.result';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '@/domain/tenant/repositories/tenant.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@CommandHandler(UpdateTenantProfileCommand)
export class UpdateTenantProfileHandler implements ICommandHandler<UpdateTenantProfileCommand> {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: UpdateTenantProfileCommand,
  ): Promise<UpdateTenantProfileResult> {
    const tenant = await this.tenantRepository.findById(
      TenantId.createFromString(command.tenantId),
    );

    if (!tenant) {
      throw new NotFoundException(`Tenant not found`);
    }

    tenant.updateProfile(
      command.name,
      command.contactPhone,
      command.address,
      command.website,
      command.logoUrl,
    );

    await this.tenantRepository.save(tenant);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.TENANT_PROFILE_UPDATED,
        AuditEntityType.TENANT,
        command.tenantId,
        {
          name: command.name,
          contactPhone: command.contactPhone,
          address: command.address,
          website: command.website,
          logoUrl: command.logoUrl,
        },
      ),
    );

    return new UpdateTenantProfileResult(command.tenantId);
  }
}
