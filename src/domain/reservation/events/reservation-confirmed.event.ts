export const RESERVATION_CONFIRMED_EVENT = 'reservation.confirmed';

export class ReservationConfirmedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly reservationId: string,
    public readonly guestId: string,
    public readonly checkIn: Date,
    public readonly checkOut: Date,
  ) {}
}
