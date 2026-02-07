export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked-in',
  CHECKED_OUT = 'checked-out',
  CANCELLED = 'cancelled',
}

export class Reservation {
  constructor(
    public readonly id: string,
    public readonly guestName: string,
    public readonly guestEmail: string,
    public readonly guestPhone: string,
    public readonly roomNumber: string,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly status: ReservationStatus,
    public readonly numberOfGuests: number,
    public readonly createdAt: Date,
  ) {}
}
