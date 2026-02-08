import type { Room } from '../../rooms/entities/room.entity';

export interface RoomRepository {
  findById(id: string): Promise<Room | null>;
  findByRoomTypeId(roomTypeId: string): Promise<Room[]>;
  findByHotelId(hotelId: string): Promise<Room[]>;
  findByRoomNumber(hotelId: string, roomNumber: string): Promise<Room | null>;
  save(room: any): Promise<Room>;
  saveMany(rooms: any[]): Promise<Room[]>;
  update(id: string, room: Partial<Room>): Promise<void>;
  delete(id: string): Promise<void>;
}
