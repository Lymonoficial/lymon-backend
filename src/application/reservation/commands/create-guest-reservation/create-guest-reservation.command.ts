export class CreateGuestReservationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly guestAccountId: string,
    public readonly actorEmail: string,
    public readonly propertyId: string,
    public readonly unitId: string,
    public readonly checkIn: Date,
    public readonly checkOut: Date,
    public readonly guestsCount: number,
    public readonly notes: string | null,
  ) {}
}
