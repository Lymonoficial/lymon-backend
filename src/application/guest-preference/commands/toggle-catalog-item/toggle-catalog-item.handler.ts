import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ToggleCatalogItemCommand } from './toggle-catalog-item.command';
import {
  GUEST_PREFERENCE_CATALOG_REPOSITORY,
  type GuestPreferenceCatalogRepository,
} from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@CommandHandler(ToggleCatalogItemCommand)
export class ToggleCatalogItemHandler implements ICommandHandler<
  ToggleCatalogItemCommand,
  void
> {
  constructor(
    @Inject(GUEST_PREFERENCE_CATALOG_REPOSITORY)
    private readonly repository: GuestPreferenceCatalogRepository,
  ) {}

  async execute(command: ToggleCatalogItemCommand): Promise<void> {
    const tenantId = TenantId.createFromString(command.tenantId);

    const item = await this.repository.findById(command.itemId);

    if (!item || item.getTenantId().toString() !== tenantId.toString()) {
      throw new NotFoundException('Catalog item not found');
    }

    if (command.activate) {
      item.activate();
    } else {
      item.deactivate();
    }

    await this.repository.save(item);
  }
}
