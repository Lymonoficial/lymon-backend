export interface GuestBookingDto {
  id: string;
  property: string;
  unit: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalAmount: number;
  source: string;
  createdAt: Date;
}

export interface GetGuestBookingsResult {
  items: GuestBookingDto[];
}
