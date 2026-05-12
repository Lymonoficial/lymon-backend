export class GetGuestCartQuery {
  constructor(
    readonly guestAccountId: string,
    readonly tenantId: string,
  ) {}
}
