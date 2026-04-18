import { GuestPreferenceItem } from '@/domain/guest/value-objects/guest-preference-item.vo';

export class SaveGuestPreferencesCommand {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
    public readonly preferences: GuestPreferenceItem[],
    public readonly activePlan: string,
  ) {}
}
