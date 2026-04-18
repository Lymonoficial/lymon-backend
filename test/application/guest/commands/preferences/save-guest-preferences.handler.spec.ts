import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SaveGuestPreferencesHandler } from '@/application/guest/commands/preferences/save-guest-preferences.handler';
import { SaveGuestPreferencesCommand } from '@/application/guest/commands/preferences/save-guest-preferences.command';
import { SaveGuestPreferencesResult } from '@/application/guest/commands/preferences/save-guest-preferences.result';
import { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GuestPreferenceCatalogRepository } from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import { PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';
import { createGuestPreferenceCatalogRepositoryMock } from '@test/shared/mocks/repositories/guest-preference-catalog-repository.mock';
import {
  makeGuest,
  GUEST_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/guest.fixture';
import {
  GuestPreferenceCatalogItem,
  GuestPreferenceSourceEnum,
} from '@/domain/guest-preference/entities/guest-preference-catalog-item.entity';
import { GuestPreferenceCategoryEnum } from '@/domain/guest-preference/value-objects/guest-preference-category.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestPreferenceItem } from '@/domain/guest/value-objects/guest-preference-item.vo';

const GUEST_ID = GUEST_FIXTURE_DEFAULTS.id;
const TENANT_ID = 'tenant-xyz-456';

const CATALOG_ITEM_ID_1 = 'item-001';
const CATALOG_ITEM_ID_2 = 'item-002';

function makeCatalogItem(
  id: string,
  label: string,
  tenantId = TENANT_ID,
): GuestPreferenceCatalogItem {
  return GuestPreferenceCatalogItem.reconstitute({
    id,
    tenantId: TenantId.createFromString(tenantId),
    category: GuestPreferenceCategoryEnum.ROOM,
    source: GuestPreferenceSourceEnum.CUSTOM,
    key: null,
    label,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

const EXISTING_PREFERENCE: GuestPreferenceItem = {
  catalogItemId: CATALOG_ITEM_ID_1,
  labelSnapshot: 'Piso alto',
  category: GuestPreferenceCategoryEnum.ROOM,
};

function makeCommand(
  overrides: Partial<{
    tenantId: string;
    guestId: string;
    catalogItemIds: string[];
    activePlan: string;
  }> = {},
): SaveGuestPreferencesCommand {
  return new SaveGuestPreferencesCommand(
    overrides.tenantId ?? TENANT_ID,
    overrides.guestId ?? GUEST_ID,
    overrides.catalogItemIds ?? [CATALOG_ITEM_ID_1],
    overrides.activePlan ?? PlanTypeEnum.LYMON_PLUS,
  );
}

describe('SaveGuestPreferencesHandler', () => {
  let handler: SaveGuestPreferencesHandler;
  let guestRepository: jest.Mocked<GuestRepository>;
  let catalogRepository: jest.Mocked<GuestPreferenceCatalogRepository>;

  beforeEach(() => {
    guestRepository = createGuestRepositoryMock();
    catalogRepository = createGuestPreferenceCatalogRepositoryMock();
    handler = new SaveGuestPreferencesHandler(
      guestRepository,
      catalogRepository,
    );
  });

  describe('validatePlanAccess — falla rápida sin consulta a BD', () => {
    it.each([PlanTypeEnum.LYMON_ONE, PlanTypeEnum.TRIAL])(
      'lanza ForbiddenException para el plan %s',
      async (plan) => {
        const command = makeCommand({ activePlan: plan });

        await expect(handler.execute(command)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(handler.execute(command)).rejects.toThrow(
          'LYMON_PLUS or LYMON_PRIME plan',
        );
        expect(guestRepository.findById).not.toHaveBeenCalled();
      },
    );
  });

  describe('cuando el guest no existe', () => {
    it('lanza NotFoundException con el ID del guest', async () => {
      guestRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(makeCommand())).rejects.toThrow(
        NotFoundException,
      );
      await expect(handler.execute(makeCommand())).rejects.toThrow(GUEST_ID);
    });
  });

  describe('cuando el guest pertenece a otro tenant', () => {
    it('lanza ForbiddenException sin persistir cambios', async () => {
      const guest = makeGuest({ tenantId: 'otro-tenant-999' });
      guestRepository.findById.mockResolvedValue(guest);

      await expect(handler.execute(makeCommand())).rejects.toThrow(
        ForbiddenException,
      );
      expect(guestRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('happy path — CREATE (primera vez)', () => {
    it('retorna wasCreated:true cuando el guest no tenía preferencias previas', async () => {
      const guest = makeGuest({ tenantId: TENANT_ID, id: GUEST_ID });
      jest.spyOn(guest, 'getPreferences').mockReturnValue([]);
      const setPreferencesSpy = jest.spyOn(guest, 'setPreferences');
      guestRepository.findById.mockResolvedValue(guest);
      guestRepository.save.mockResolvedValue(GUEST_ID);
      catalogRepository.findByTenant.mockResolvedValue([
        makeCatalogItem(CATALOG_ITEM_ID_1, 'Piso alto'),
      ]);

      const result = await handler.execute(
        makeCommand({ catalogItemIds: [CATALOG_ITEM_ID_1] }),
      );

      expect(setPreferencesSpy).toHaveBeenCalledWith([
        {
          catalogItemId: CATALOG_ITEM_ID_1,
          labelSnapshot: 'Piso alto',
          category: GuestPreferenceCategoryEnum.ROOM,
        },
      ]);
      expect(guestRepository.save).toHaveBeenCalledWith(guest);
      expect(result).toBeInstanceOf(SaveGuestPreferencesResult);
      expect(result.guestId).toBe(GUEST_ID);
      expect(result.wasCreated).toBe(true);
    });
  });

  describe('happy path — UPDATE (ya existían preferencias)', () => {
    it('retorna wasCreated:false cuando el guest ya tenía preferencias', async () => {
      const guest = makeGuest({ tenantId: TENANT_ID, id: GUEST_ID });
      jest
        .spyOn(guest, 'getPreferences')
        .mockReturnValue([EXISTING_PREFERENCE]);
      const setPreferencesSpy = jest.spyOn(guest, 'setPreferences');
      guestRepository.findById.mockResolvedValue(guest);
      guestRepository.save.mockResolvedValue(GUEST_ID);
      catalogRepository.findByTenant.mockResolvedValue([
        makeCatalogItem(CATALOG_ITEM_ID_2, 'Habitación silenciosa'),
      ]);

      const result = await handler.execute(
        makeCommand({ catalogItemIds: [CATALOG_ITEM_ID_2] }),
      );

      expect(setPreferencesSpy).toHaveBeenCalledWith([
        {
          catalogItemId: CATALOG_ITEM_ID_2,
          labelSnapshot: 'Habitación silenciosa',
          category: GuestPreferenceCategoryEnum.ROOM,
        },
      ]);
      expect(guestRepository.save).toHaveBeenCalledWith(guest);
      expect(result).toBeInstanceOf(SaveGuestPreferencesResult);
      expect(result.guestId).toBe(GUEST_ID);
      expect(result.wasCreated).toBe(false);
    });
  });
});
