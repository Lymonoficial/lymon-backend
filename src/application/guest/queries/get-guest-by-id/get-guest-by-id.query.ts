export class GetGuestByIdQuery {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
  ) {}
}
