export class CheckoutCartCommand {
  constructor(
    readonly guestAccountId: string,
    readonly tenantId: string,
    readonly actorId: string,
    readonly actorEmail: string,
  ) {}
}
