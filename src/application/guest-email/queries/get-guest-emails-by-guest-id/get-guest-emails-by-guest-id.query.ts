export class GetGuestEmailsByGuestIdQuery {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
  ) {}
}
