export class GetGuestAverageStayDurationQuery {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
  ) {}
}
