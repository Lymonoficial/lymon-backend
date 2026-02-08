import type { RoomType } from '../entities/room-type.entity';

export interface RoomTypeRepository {
  findById(id: string): Promise<RoomType | null>;
  findByHotelId(hotelId: string): Promise<RoomType[]>;
  save(roomType: any): Promise<RoomType>;
  update(id: string, roomType: Partial<RoomType>): Promise<void>;
  delete(id: string): Promise<void>;
}
