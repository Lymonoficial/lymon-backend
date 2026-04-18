import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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
  options: { tenantId?: string; isActive?: boolean } = {},
): GuestPreferenceCatalogItem {
  return GuestPreferenceCatalogItem.reconstitute({
    id,
    tenantId: TenantId.createFromString(options.tenantId ?? TENANT_ID),
    category: GuestPreferenceCategoryEnum.ROOM,
    source: GuestPreferenceSourceEnum.CUSTOM,
    key: null,
    label,
    isActive: options.isActive ?? true,
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

  // ── Scenario 1 (complementary): inactive item rejection ───────────────────

  describe('Scenario 1 — Visibility: rejects inactive catalog items', () => {
    it('throws BadRequestException when the catalogItemId belongs to an inactive item', async () => {
      const guest = makeGuest({ tenantId: TENANT_ID, id: GUEST_ID });
      guestRepository.findById.mockResolvedValue(guest);
      catalogRepository.findByTenant.mockResolvedValue([
        makeCatalogItem(CATALOG_ITEM_ID_1, 'Ítem desactivado', {
          isActive: false,
        }),
      ]);

      await expect(
        handler.execute(makeCommand({ catalogItemIds: [CATALOG_ITEM_ID_1] })),
      ).rejects.toThrow(BadRequestException);

      await expect(
        handler.execute(makeCommand({ catalogItemIds: [CATALOG_ITEM_ID_1] })),
      ).rejects.toThrow('is not active');

      expect(guestRepository.save).not.toHaveBeenCalled();
    });
  });

  // ── Scenario 3: Snapshot Integrity ────────────────────────────────────────

  describe('Scenario 3 — Snapshot Integrity: labelSnapshot is captured at assignment time', () => {
    it('stores the label from the catalog as a snapshot, independent of future catalog changes', async () => {
      // Arrange: guest with no prior preferences (real entity, no spy on setPreferences)
      const guest = makeGuest({ tenantId: TENANT_ID, id: GUEST_ID });
      const catalogItemWithLabel = makeCatalogItem(
        CATALOG_ITEM_ID_1,
        'Piso alto',
      );
      guestRepository.findById.mockResolvedValue(guest);
      guestRepository.save.mockResolvedValue(GUEST_ID);
      catalogRepository.findByTenant.mockResolvedValue([catalogItemWithLabel]);

      // Act: assign preference → snapshot captured
      await handler.execute(
        makeCommand({ catalogItemIds: [CATALOG_ITEM_ID_1] }),
      );

      // Assert: the snapshot is embedded in the guest entity
      const storedPreferences = guest.getPreferences();
      expect(storedPreferences).toHaveLength(1);
      expect(storedPreferences[0].catalogItemId).toBe(CATALOG_ITEM_ID_1);
      expect(storedPreferences[0].labelSnapshot).toBe('Piso alto');
      expect(storedPreferences[0].category).toBe(
        GuestPreferenceCategoryEnum.ROOM,
      );

      // Simulate catalog deletion: catalog no longer returns this item
      catalogRepository.findByTenant.mockResolvedValue([]);

      // The snapshot is unchanged — it lives in the guest entity, not the catalog
      const preservedPreferences = guest.getPreferences();
      expect(preservedPreferences).toHaveLength(1);
      expect(preservedPreferences[0].labelSnapshot).toBe('Piso alto');
    });
  });

  // ── Scenario 4: Tenant Isolation ──────────────────────────────────────────

  describe("Scenario 4 — Tenant Isolation: cannot use another tenant's catalog item", () => {
    it('throws BadRequestException when the catalogItemId belongs to a different tenant', async () => {
      const TENANT_B = 'tenant-other-999';
      const ITEM_FROM_TENANT_A = 'item-tenant-a-001';

      // Guest belongs to TENANT_B; command is authenticated as TENANT_B
      const guest = makeGuest({ tenantId: TENANT_B, id: GUEST_ID });
      guestRepository.findById.mockResolvedValue(guest);
      guestRepository.save.mockResolvedValue(GUEST_ID);

      // findByTenant(TENANT_B) returns only TENANT_B's items — not tenant A's
      catalogRepository.findByTenant.mockResolvedValue([
        makeCatalogItem('item-tenant-b-001', 'Habitación silenciosa', {
          tenantId: TENANT_B,
        }),
      ]);

      // Command tries to assign an item that belongs to TENANT_A
      await expect(
        handler.execute(
          new SaveGuestPreferencesCommand(
            TENANT_B,
            GUEST_ID,
            [ITEM_FROM_TENANT_A], // ← ID from tenant A
            PlanTypeEnum.LYMON_PLUS,
          ),
        ),
      ).rejects.toThrow(BadRequestException);

      await expect(
        handler.execute(
          new SaveGuestPreferencesCommand(
            TENANT_B,
            GUEST_ID,
            [ITEM_FROM_TENANT_A],
            PlanTypeEnum.LYMON_PLUS,
          ),
        ),
      ).rejects.toThrow('does not exist or does not belong to this tenant');

      expect(guestRepository.save).not.toHaveBeenCalled();
    });

    it('succeeds when the guest and catalog item belong to the same tenant', async () => {
      const TENANT_B = 'tenant-other-999';
      const ITEM_FROM_TENANT_B = 'item-tenant-b-001';

      const guest = makeGuest({ tenantId: TENANT_B, id: GUEST_ID });
      guestRepository.findById.mockResolvedValue(guest);
      guestRepository.save.mockResolvedValue(GUEST_ID);
      catalogRepository.findByTenant.mockResolvedValue([
        makeCatalogItem(ITEM_FROM_TENANT_B, 'Habitación silenciosa', {
          tenantId: TENANT_B,
        }),
      ]);

      const result = await handler.execute(
        new SaveGuestPreferencesCommand(
          TENANT_B,
          GUEST_ID,
          [ITEM_FROM_TENANT_B],
          PlanTypeEnum.LYMON_PLUS,
        ),
      );

      expect(result).toBeInstanceOf(SaveGuestPreferencesResult);
      expect(guestRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
