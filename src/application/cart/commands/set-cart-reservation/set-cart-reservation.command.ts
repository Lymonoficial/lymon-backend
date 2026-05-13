export class SetCartReservationCommand {
  constructor(
    readonly guestAccountId: string,
    readonly tenantId: string,
    readonly reservationId: string,
    readonly actorEmail: string,
  ) {}
}
