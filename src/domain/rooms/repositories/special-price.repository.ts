import { SpecialPrice } from '../../rooms/entities/special-price.entity';

export interface SpecialPriceRepository {
  create(specialPrice: SpecialPrice): Promise<SpecialPrice>;
  findById(id: string): Promise<SpecialPrice | null>;
  findByRoomId(roomId: string): Promise<SpecialPrice[]>;
  findByHotelId(hotelId: string): Promise<SpecialPrice[]>;
  findActiveForDate(roomId: string, date: Date): Promise<SpecialPrice | null>;
  update(id: string, specialPrice: Partial<SpecialPrice>): Promise<SpecialPrice | null>;
  delete(id: string): Promise<void>;
}
