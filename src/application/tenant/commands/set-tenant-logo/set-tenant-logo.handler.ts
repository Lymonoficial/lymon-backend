import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SetTenantLogoCommand } from './set-tenant-logo.command';
import { tenantLogoPrefix } from '@/application/tenant/logo/tenant-logo-key';
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
import {
  R2StorageService,
  R2_STORAGE_SERVICE,
} from '@/infrastructure/storage/r2-storage.service';

export class SetTenantLogoResult {
  constructor(public readonly logoUrl: string) {}
}

@CommandHandler(SetTenantLogoCommand)
export class SetTenantLogoHandler
  implements ICommandHandler<SetTenantLogoCommand>
{
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(R2_STORAGE_SERVICE)
    private readonly storageService: R2StorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: SetTenantLogoCommand): Promise<SetTenantLogoResult> {
    // The key comes from the client; it must live under this tenant's own prefix
    // so a tenant can't claim someone else's (or an arbitrary) object.
    if (!command.key.startsWith(tenantLogoPrefix(command.tenantId))) {
      throw new BadRequestException('Invalid logo key');
    }

    const tenant = await this.tenantRepository.findById(
      TenantId.createFromString(command.tenantId),
    );

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // We store the key, not the URL, so the previous key needs no URL parsing.
    const oldKey = tenant.getLogoKey();

    tenant.setLogoKey(command.key);
    await this.tenantRepository.save(tenant);

    // Best-effort: remove the old logo once the new one is committed.
    if (oldKey && oldKey !== command.key) {
      await this.storageService.deleteObjects([oldKey]);
    }

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.TENANT_PROFILE_UPDATED,
        AuditEntityType.TENANT,
        command.tenantId,
        { logoKey: command.key },
      ),
    );

    return new SetTenantLogoResult(this.storageService.getPublicUrl(command.key));
  }
}
