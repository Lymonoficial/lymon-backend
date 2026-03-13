export class UpdateReservationCommand {
  constructor(
    public readonly reservationId: string,
    public readonly tenantId: string,
    public readonly checkIn: Date | null,
    public readonly checkOut: Date | null,
    public readonly notes: string | null,
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
