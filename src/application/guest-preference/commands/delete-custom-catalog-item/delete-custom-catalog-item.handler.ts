import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteCustomCatalogItemCommand } from './delete-custom-catalog-item.command';
import {
  GUEST_PREFERENCE_CATALOG_REPOSITORY,
  type GuestPreferenceCatalogRepository,
} from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import { GuestPreferenceSourceEnum } from '@/domain/guest-preference/entities/guest-preference-catalog-item.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';

const PLANS_WITH_CUSTOM_CATALOG: string[] = [
  PlanTypeEnum.LYMON_PLUS,
  PlanTypeEnum.LYMON_PRIME,
];

@CommandHandler(DeleteCustomCatalogItemCommand)
export class DeleteCustomCatalogItemHandler implements ICommandHandler<
  DeleteCustomCatalogItemCommand,
  void
> {
  constructor(
    @Inject(GUEST_PREFERENCE_CATALOG_REPOSITORY)
    private readonly repository: GuestPreferenceCatalogRepository,
  ) {}

  async execute(command: DeleteCustomCatalogItemCommand): Promise<void> {
    this.validatePlanAccess(command.activePlan);

    const tenantId = TenantId.createFromString(command.tenantId);
    const item = await this.repository.findById(command.itemId);

    if (!item || item.getTenantId().toString() !== tenantId.toString()) {
      throw new NotFoundException('Catalog item not found');
    }

    if (item.getSource() !== GuestPreferenceSourceEnum.CUSTOM) {
      throw new ForbiddenException('Operation only allowed on CUSTOM items');
    }

    await this.repository.delete(command.itemId);
  }

  private validatePlanAccess(activePlan: string): void {
    if (!PLANS_WITH_CUSTOM_CATALOG.includes(activePlan)) {
      throw new ForbiddenException(
        'Custom preference management requires a LYMON_PLUS or LYMON_PRIME plan. Please upgrade your plan.',
      );
    }
  }
}
