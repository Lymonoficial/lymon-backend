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

export interface IChannexService {
  createProperty(data: ChannexPropertyData): Promise<{ channexId: string }>;
}
