import { ForbiddenException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCustomCatalogItemCommand } from './create-custom-catalog-item.command';
import {
  GUEST_PREFERENCE_CATALOG_REPOSITORY,
  type GuestPreferenceCatalogRepository,
} from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import {
  GuestPreferenceCatalogItem,
  GuestPreferenceSourceEnum,
} from '@/domain/guest-preference/entities/guest-preference-catalog-item.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PLANS_WITH_CUSTOM_CATALOG } from '@/application/guest-preference/guest-preference.constants';

@CommandHandler(CreateCustomCatalogItemCommand)
export class CreateCustomCatalogItemHandler implements ICommandHandler<
  CreateCustomCatalogItemCommand,
  string
> {
  constructor(
    @Inject(GUEST_PREFERENCE_CATALOG_REPOSITORY)
    private readonly repository: GuestPreferenceCatalogRepository,
  ) {}

  async execute(command: CreateCustomCatalogItemCommand): Promise<string> {
    this.validatePlanAccess(command.activePlan);

    const tenantId = TenantId.createFromString(command.tenantId);

    const item = GuestPreferenceCatalogItem.create({
      tenantId,
      category: command.category,
      source: GuestPreferenceSourceEnum.CUSTOM,
      label: command.label,
    });

    return this.repository.save(item);
  }

  private validatePlanAccess(activePlan: string): void {
    if (!PLANS_WITH_CUSTOM_CATALOG.has(activePlan)) {
      throw new ForbiddenException(
        'Custom preference management requires a LYMON_PLUS or LYMON_PRIME plan. Please upgrade your plan.',
      );
    }
  }
}
