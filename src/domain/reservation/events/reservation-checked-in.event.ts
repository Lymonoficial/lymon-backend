export const RESERVATION_CHECKED_IN_EVENT = 'reservation.checked_in';

export class ReservationCheckedInEvent {
  constructor(
    public readonly tenantId: string,
    public readonly reservationId: string,
    public readonly guestId: string,
    public readonly unitId: string,
    public readonly propertyId: string,
    public readonly checkInActualAt: Date,
  ) {}
}
