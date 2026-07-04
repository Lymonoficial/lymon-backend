export class GetGuestAverageBookingValueQuery {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
  ) {}
}