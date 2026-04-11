export class UpdateGuestPreferencesResult {
  constructor(
    public readonly guestId: string,
    public readonly success: boolean,
  ) {}
}
