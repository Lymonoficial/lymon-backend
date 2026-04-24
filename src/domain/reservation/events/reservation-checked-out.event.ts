export const RESERVATION_CHECKED_OUT_EVENT = 'reservation.checked_out';

export class ReservationCheckedOutEvent {
  constructor(
    public readonly tenantId: string,
    public readonly reservationId: string,
    public readonly guestId: string,
    public readonly unitId: string,
    public readonly propertyId: string,
    public readonly checkOutActualAt: Date,
  ) {}
}
