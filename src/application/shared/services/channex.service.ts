export const CHANNEX_SERVICE = 'CHANNEX_SERVICE';

export interface ChannexPropertyData {
  title: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export interface ChannexRoomTypeData {
  title: string;
  countOfRooms: number;
  occAdults: number;
}

export interface ChannexAvailabilityEntry {
  date: string;
  availability: number;
}

export interface ChannexBookingCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ChannexBookingData {
  bookingId: string;
  propertyId: string;
  externalId: string;
  arrivalDate: string;
  departureDate: string;
  roomTypeId: string;
  guestsCount: number;
  totalAmount: number;
  customer: ChannexBookingCustomer;
}

export interface IChannexService {
  createProperty(data: ChannexPropertyData): Promise<{ channexId: string }>;
  updateProperty(channexId: string, data: ChannexPropertyData): Promise<void>;
  createRoomType(
    propertyChannexId: string,
    data: ChannexRoomTypeData,
  ): Promise<{ roomTypeId: string }>;
  updateAvailability(
    propertyChannexId: string,
    roomTypeId: string,
    entries: ChannexAvailabilityEntry[],
  ): Promise<void>;
  getBooking(bookingId: string): Promise<ChannexBookingData>;
}
