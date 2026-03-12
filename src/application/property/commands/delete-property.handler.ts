import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { DeletePropertyCommand } from '@/application/property/commands/delete-property.command';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';

@CommandHandler(DeletePropertyCommand)
export class DeletePropertyHandler
  implements ICommandHandler<DeletePropertyCommand>
{
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: DeletePropertyCommand): Promise<void> {
    if (!command.isOwner) {
      throw new ForbiddenException('Only the tenant owner can delete properties');
    }

    const propertyId = PropertyId.create(command.propertyId);
    const property = await this.propertyRepository.findById(propertyId);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const tenantId = TenantId.createFromString(command.tenantId);
    if (property.getTenantId().toString() !== tenantId.toString()) {
      throw new ForbiddenException('Property does not belong to your tenant');
    }

    await this.propertyRepository.delete(propertyId);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.userId,
        command.email,
        AuditAction.PROPERTY_DELETED,
        AuditEntityType.PROPERTY,
        command.propertyId,
      ),
    );
  }
}
