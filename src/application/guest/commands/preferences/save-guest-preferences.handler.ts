import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { SaveGuestPreferencesCommand } from './save-guest-preferences.command';
import { SaveGuestPreferencesResult } from './save-guest-preferences.result';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import type { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';
import { PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';
import type { GuestPreferenceCatalogRepository } from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import { GUEST_PREFERENCE_CATALOG_REPOSITORY } from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import type { GuestPreferenceItem } from '@/domain/guest/value-objects/guest-preference-item.vo';

const PLANS_WITH_PREFERENCES_ACCESS: string[] = [
  PlanTypeEnum.LYMON_PLUS,
  PlanTypeEnum.LYMON_PRIME,
];

@CommandHandler(SaveGuestPreferencesCommand)
export class SaveGuestPreferencesHandler implements ICommandHandler<
  SaveGuestPreferencesCommand,
  SaveGuestPreferencesResult
> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly repository: GuestRepository,
    @Inject(GUEST_PREFERENCE_CATALOG_REPOSITORY)
    private readonly catalogRepository: GuestPreferenceCatalogRepository,
  ) {}

  async execute(
    command: SaveGuestPreferencesCommand,
  ): Promise<SaveGuestPreferencesResult> {
    const { tenantId, guestId, catalogItemIds, activePlan } = command;

    this.validatePlanAccess(activePlan);

    const guest = await this.repository.findById(
      GuestId.createFromString(guestId),
    );

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }

    if (guest.getTenantId().toString() !== tenantId) {
      throw new ForbiddenException(
        'You do not have permission to modify this guest',
      );
    }

    const preferences = await this.buildPreferenceItems(
      tenantId,
      catalogItemIds,
    );

    const wasCreated = guest.getPreferences().length === 0;

    guest.setPreferences(preferences);
    await this.repository.save(guest);

    return new SaveGuestPreferencesResult(guestId, wasCreated);
  }

  private validatePlanAccess(activePlan: string): void {
    if (!PLANS_WITH_PREFERENCES_ACCESS.includes(activePlan)) {
      throw new ForbiddenException(
        'Guest preferences management requires a LYMON_PLUS or LYMON_PRIME plan. Please upgrade your plan.',
      );
    }
  }

  private async buildPreferenceItems(
    tenantId: string,
    catalogItemIds: string[],
  ): Promise<GuestPreferenceItem[]> {
    if (catalogItemIds.length === 0) return [];

    const catalogItems = await this.catalogRepository.findByTenant(
      TenantId.createFromString(tenantId),
    );

    const catalogMap = new Map(
      catalogItems.map((item) => [item.getId()!, item]),
    );

    const result: GuestPreferenceItem[] = [];

    for (const id of catalogItemIds) {
      const catalogItem = catalogMap.get(id);

      if (!catalogItem) {
        throw new BadRequestException(
          `Preference catalog item '${id}' does not exist or does not belong to this tenant`,
        );
      }

      if (!catalogItem.getIsActive()) {
        throw new BadRequestException(
          `Preference catalog item '${id}' is not active`,
        );
      }

      result.push({
        catalogItemId: id,
        labelSnapshot: catalogItem.getLabel() ?? catalogItem.getKey() ?? '',
        category: catalogItem.getCategory(),
      });
    }

    return result;
  }
}
