import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCustomCatalogItemCommand } from './update-custom-catalog-item.command';
import {
  GUEST_PREFERENCE_CATALOG_REPOSITORY,
  type GuestPreferenceCatalogRepository,
} from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import { GuestPreferenceSourceEnum } from '@/domain/guest-preference/entities/guest-preference-catalog-item.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PLANS_WITH_CUSTOM_CATALOG } from '@/application/guest-preference/guest-preference.constants';

@CommandHandler(UpdateCustomCatalogItemCommand)
export class UpdateCustomCatalogItemHandler implements ICommandHandler<
  UpdateCustomCatalogItemCommand,
  void
> {
  constructor(
    @Inject(GUEST_PREFERENCE_CATALOG_REPOSITORY)
    private readonly repository: GuestPreferenceCatalogRepository,
  ) {}

  async execute(command: UpdateCustomCatalogItemCommand): Promise<void> {
    this.validatePlanAccess(command.activePlan);

    const tenantId = TenantId.createFromString(command.tenantId);
    const item = await this.repository.findById(command.itemId);

    if (item?.getTenantId().toString() !== tenantId.toString()) {
      throw new NotFoundException('Catalog item not found');
    }

    if (item.getSource() !== GuestPreferenceSourceEnum.CUSTOM) {
      throw new ForbiddenException('Operation only allowed on CUSTOM items');
    }

    item.update(command.label, command.category);

    await this.repository.save(item);
  }

  private validatePlanAccess(activePlan: string): void {
    if (!PLANS_WITH_CUSTOM_CATALOG.has(activePlan)) {
      throw new ForbiddenException(
        'Custom preference management requires a LYMON_PLUS or LYMON_PRIME plan. Please upgrade your plan.',
      );
    }
  }
}
