export const RESERVATION_CANCELLED_EVENT = 'reservation.cancelled';

export class ReservationCancelledEvent {
  constructor(
    public readonly tenantId: string,
    public readonly reservationId: string,
    public readonly guestId: string,
    public readonly cancelledAt: Date,
    public readonly reason: string | null,
  ) {}
}
