export interface GuestReservationDetailResult {
  id: string;
  bookingReference: string;
  propertyId: string;
  propertyName: string | null;
  unitId: string;
  unitName: string | null;
  serviceName: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  status: string;
  guestsCount: number;
  notes: string | null;
  source: string;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  checkInActualAt: Date | null;
  checkOutActualAt: Date | null;
  priceBreakdown: {
    pricePerNight: number;
    nights: number;
    totalPrice: number;
  };
  actions: {
    contactSupport: {
      enabled: true;
      channel: 'email';
    };
  };
}
