export class ReservationDto {
  id: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  source: string;
  status: string;
  guestsCount: number;
  pricePerNight: number;
  totalPrice: number;
  notes: string | null;
  externalReservationId: string | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  checkInActualAt: Date | null;
  checkOutActualAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
