export class ProcessChannexBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly externalId: string,
    public readonly propertyChannexId: string,
    public readonly roomTypeId: string,
    public readonly arrivalDate: string,
    public readonly departureDate: string,
    public readonly guestsCount: number,
    public readonly totalAmount: number,
    public readonly customerFirstName: string,
    public readonly customerLastName: string,
    public readonly customerEmail: string,
    public readonly customerPhone: string,
  ) {}
}
