import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateGuestPreferencesHandler } from '@/application/guest/commands/preferences/update-guest-preferences.handler';
import { UpdateGuestPreferencesCommand } from '@/application/guest/commands/preferences/update-guest-preferences.command';
import { UpdateGuestPreferencesResult } from '@/application/guest/commands/preferences/update-guest-preferences.result';
import { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';
import { makeGuest, GUEST_FIXTURE_DEFAULTS } from '@test/shared/fixtures/guest.fixture';

const GUEST_ID = GUEST_FIXTURE_DEFAULTS.id;
const TENANT_ID = 'tenant-xyz-456';

function makeCommand(
  overrides: Partial<{
    tenantId: string;
    guestId: string;
    preferencesNotes: string;
    activePlan: string;
  }> = {},
): UpdateGuestPreferencesCommand {
  return new UpdateGuestPreferencesCommand(
    overrides.tenantId ?? TENANT_ID,
    overrides.guestId ?? GUEST_ID,
    overrides.preferencesNotes ?? 'Prefiere piso alto',
    overrides.activePlan ?? PlanTypeEnum.LYMON_PLUS,
  );
}

describe('UpdateGuestPreferencesHandler', () => {
  let handler: UpdateGuestPreferencesHandler;
  let guestRepository: jest.Mocked<GuestRepository>;

  beforeEach(() => {
    guestRepository = createGuestRepositoryMock();
    handler = new UpdateGuestPreferencesHandler(guestRepository);
  });

  describe('validatePlanAccess — falla rápida sin consulta a BD', () => {
    it.each([PlanTypeEnum.LYMON_ONE, PlanTypeEnum.TRIAL])(
      'lanza ForbiddenException para el plan %s',
      async (plan) => {
        const command = makeCommand({ activePlan: plan });

        await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
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

      await expect(handler.execute(makeCommand())).rejects.toThrow(NotFoundException);
      await expect(handler.execute(makeCommand())).rejects.toThrow(GUEST_ID);
    });
  });

  describe('cuando el guest pertenece a otro tenant', () => {
    it('lanza ForbiddenException sin persistir cambios', async () => {
      const guest = makeGuest({ tenantId: 'otro-tenant-999' });
      guestRepository.findById.mockResolvedValue(guest);

      await expect(handler.execute(makeCommand())).rejects.toThrow(ForbiddenException);
      expect(guestRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('happy path', () => {
    it.each([PlanTypeEnum.LYMON_PLUS, PlanTypeEnum.LYMON_PRIME])(
      'actualiza las preferencias y retorna success:true para el plan %s',
      async (plan) => {
        const notes = 'Prefiere almohadas extra';
        const guest = makeGuest({ tenantId: TENANT_ID, id: GUEST_ID });
        const setNotesSpy = jest.spyOn(guest, 'setPreferencesNotes');
        guestRepository.findById.mockResolvedValue(guest);
        guestRepository.save.mockResolvedValue(GUEST_ID);

        const result = await handler.execute(
          makeCommand({ activePlan: plan, preferencesNotes: notes }),
        );

        expect(setNotesSpy).toHaveBeenCalledWith(notes);
        expect(guestRepository.save).toHaveBeenCalledWith(guest);
        expect(result).toBeInstanceOf(UpdateGuestPreferencesResult);
        expect(result.guestId).toBe(GUEST_ID);
        expect(result.success).toBe(true);
      },
    );
  });
});
