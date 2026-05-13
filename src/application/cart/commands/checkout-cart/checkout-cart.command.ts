export class CheckoutCartCommand {
  constructor(
    readonly guestAccountId: string,
    readonly actorId: string,
    readonly actorEmail: string,
  ) {}
}
