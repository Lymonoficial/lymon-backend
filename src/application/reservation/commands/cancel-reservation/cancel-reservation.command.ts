export class CancelReservationCommand {
  constructor(
    public readonly reservationId: string,
    public readonly tenantId: string,
    public readonly reason: string | null,
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
