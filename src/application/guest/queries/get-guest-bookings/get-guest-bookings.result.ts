export interface GuestBookingDto {
  id: string;
  propertyId: string;
  propertyName: string | null;
  unitId: string;
  unitName: string | null;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalAmount: number;
  source: string;
  createdAt: Date;
  nights: number;
  guestsCount: number;
  notes: string | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  checkInActualAt: Date | null;
  checkOutActualAt: Date | null;
}

export interface GetGuestBookingsResult {
  items: GuestBookingDto[];
}
