import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SaveGuestPreferencesHandler } from '@/application/guest/commands/preferences/save-guest-preferences.handler';
import { SaveGuestPreferencesCommand } from '@/application/guest/commands/preferences/save-guest-preferences.command';
import { SaveGuestPreferencesResult } from '@/application/guest/commands/preferences/save-guest-preferences.result';
import { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';
import {
  makeGuest,
  GUEST_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/guest.fixture';
import { GuestPreferenceItem } from '@/domain/guest/value-objects/guest-preference-item.vo';
import { GuestPreferenceCategoryEnum } from '@/domain/guest-preference/value-objects/guest-preference-category.vo';

const GUEST_ID = GUEST_FIXTURE_DEFAULTS.id;
const TENANT_ID = 'tenant-xyz-456';

const SAMPLE_PREFERENCES: GuestPreferenceItem[] = [
  {
    catalogItemId: 'item-001',
    labelSnapshot: 'Piso alto',
    category: GuestPreferenceCategoryEnum.ROOM,
  },
];

function makeCommand(
  overrides: Partial<{
    tenantId: string;
    guestId: string;
    preferences: GuestPreferenceItem[];
    activePlan: string;
  }> = {},
): SaveGuestPreferencesCommand {
  return new SaveGuestPreferencesCommand(
    overrides.tenantId ?? TENANT_ID,
    overrides.guestId ?? GUEST_ID,
    overrides.preferences ?? SAMPLE_PREFERENCES,
    overrides.activePlan ?? PlanTypeEnum.LYMON_PLUS,
  );
}

describe('SaveGuestPreferencesHandler', () => {
  let handler: SaveGuestPreferencesHandler;
  let guestRepository: jest.Mocked<GuestRepository>;

  beforeEach(() => {
    guestRepository = createGuestRepositoryMock();
    handler = new SaveGuestPreferencesHandler(guestRepository);
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

      const result = await handler.execute(
        makeCommand({ preferences: SAMPLE_PREFERENCES }),
      );

      expect(setPreferencesSpy).toHaveBeenCalledWith(SAMPLE_PREFERENCES);
      expect(guestRepository.save).toHaveBeenCalledWith(guest);
      expect(result).toBeInstanceOf(SaveGuestPreferencesResult);
      expect(result.guestId).toBe(GUEST_ID);
      expect(result.wasCreated).toBe(true);
    });
  });

  describe('happy path — UPDATE (ya existían preferencias)', () => {
    it('retorna wasCreated:false cuando el guest ya tenía preferencias', async () => {
      const newPreferences: GuestPreferenceItem[] = [
        {
          catalogItemId: 'item-002',
          labelSnapshot: 'Habitación silenciosa',
          category: GuestPreferenceCategoryEnum.ROOM,
        },
      ];
      const guest = makeGuest({ tenantId: TENANT_ID, id: GUEST_ID });
      jest.spyOn(guest, 'getPreferences').mockReturnValue(SAMPLE_PREFERENCES);
      const setPreferencesSpy = jest.spyOn(guest, 'setPreferences');
      guestRepository.findById.mockResolvedValue(guest);
      guestRepository.save.mockResolvedValue(GUEST_ID);

      const result = await handler.execute(
        makeCommand({ preferences: newPreferences }),
      );

      expect(setPreferencesSpy).toHaveBeenCalledWith(newPreferences);
      expect(guestRepository.save).toHaveBeenCalledWith(guest);
      expect(result).toBeInstanceOf(SaveGuestPreferencesResult);
      expect(result.guestId).toBe(GUEST_ID);
      expect(result.wasCreated).toBe(false);
    });
  });
});
