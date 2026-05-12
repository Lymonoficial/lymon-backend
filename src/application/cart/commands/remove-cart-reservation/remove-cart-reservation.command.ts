export class RemoveCartReservationCommand {
  constructor(
    readonly guestAccountId: string,
    readonly tenantId: string,
  ) {}
}
