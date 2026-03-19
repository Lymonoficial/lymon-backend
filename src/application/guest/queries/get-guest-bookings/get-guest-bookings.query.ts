export class GetGuestBookingsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
  ) {}
}
