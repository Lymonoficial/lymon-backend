import { Hotel } from '../../hotels/entities/hotel.entity';

export interface HotelRepository {
  findBySubdomain(subdomain: string): Promise<Hotel | null>;
  save(hotelData: any): Promise<void>;
}
