export class SaveGuestPreferencesCommand {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
    public readonly preferencesNotes: string,
    public readonly activePlan: string,
  ) {}
}
