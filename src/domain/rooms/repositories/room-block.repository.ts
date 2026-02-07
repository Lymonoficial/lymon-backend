import {
  RoomBlock,
  RoomBlockStatus,
} from 'src/domain/rooms/entities/room-block.entity';

export type RoomBlockCreateInput = Omit<
  RoomBlock,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActiveForDate'
  | 'overlapsWithRange'
  | 'includesRoom'
>;

export interface IRoomBlockRepository {
  save(roomBlock: RoomBlockCreateInput | RoomBlock): Promise<RoomBlock>;
  findById(id: string): Promise<RoomBlock | null>;
  findByDateRange(startDate: Date, endDate: Date): Promise<RoomBlock[]>;
  findActiveByRoomNumber(
    roomNumber: string,
    startDate: Date,
    endDate: Date,
  ): Promise<RoomBlock[]>;
  findConflictingBlocks(
    roomNumbers: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<RoomBlock[]>;
  updateStatus(id: string, status: RoomBlockStatus): Promise<RoomBlock>;
}
