import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateGuestPreferencesCommand } from './update-guest-preferences.command';
import { UpdateGuestPreferencesResult } from './update-guest-preferences.result';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import type { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';
import { PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';

const PLANS_WITH_PREFERENCES_ACCESS: string[] = [
  PlanTypeEnum.LYMON_PLUS,
  PlanTypeEnum.LYMON_PRIME,
];

@CommandHandler(UpdateGuestPreferencesCommand)
export class UpdateGuestPreferencesHandler
  implements
    ICommandHandler<UpdateGuestPreferencesCommand, UpdateGuestPreferencesResult>
{
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly repository: GuestRepository,
  ) {}

  async execute(
    command: UpdateGuestPreferencesCommand,
  ): Promise<UpdateGuestPreferencesResult> {
    const { tenantId, guestId, preferencesNotes, activePlan } = command;

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

    guest.setPreferencesNotes(preferencesNotes);
    await this.repository.save(guest);

    return new UpdateGuestPreferencesResult(guestId, true);
  }

  private validatePlanAccess(activePlan: string): void {
    if (!PLANS_WITH_PREFERENCES_ACCESS.includes(activePlan)) {
      throw new ForbiddenException(
        'Guest preferences management requires a LYMON_PLUS or LYMON_PRIME plan. Please upgrade your plan.',
      );
    }
  }
}
