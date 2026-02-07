import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  type IRoomBlockRepository,
  type RoomBlockCreateInput,
} from '../../../../domain/rooms/repositories/room-block.repository';
import {
  RoomBlock,
  RoomBlockStatus,
} from '../../../../domain/rooms/entities/room-block.entity';
import { RoomBlockDocument } from './room-block.schema';

@Injectable()
export class RoomBlockRepository implements IRoomBlockRepository {
  constructor(
    @InjectModel('RoomBlock')
    private readonly roomBlockModel: Model<RoomBlockDocument>,
  ) {}

  async save(roomBlock: RoomBlockCreateInput | RoomBlock): Promise<RoomBlock> {
    const createdBlock = new this.roomBlockModel(roomBlock);
    const saved = await createdBlock.save();
    return this.toDomainEntity(saved);
  }

  async findById(id: string): Promise<RoomBlock | null> {
    const document = await this.roomBlockModel.findById(id).exec();
    return document ? this.toDomainEntity(document) : null;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<RoomBlock[]> {
    const documents = await this.roomBlockModel
      .find({
        $or: [
          // Blocks that start within the range
          {
            startDate: { $gte: startDate, $lte: endDate },
          },
          // Blocks that end within the range
          {
            endDate: { $gte: startDate, $lte: endDate },
          },
          // Blocks that span the entire range
          {
            startDate: { $lte: startDate },
            endDate: { $gte: endDate },
          },
        ],
      })
      .sort({ startDate: 1 })
      .exec();

    return documents.map((doc) => this.toDomainEntity(doc));
  }

  async findActiveByRoomNumber(
    roomNumber: string,
    startDate: Date,
    endDate: Date,
  ): Promise<RoomBlock[]> {
    const documents = await this.roomBlockModel
      .find({
        status: 'active',
        roomNumbers: roomNumber,
        $or: [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
        ],
      })
      .exec();

    return documents.map((doc) => this.toDomainEntity(doc));
  }

  async findConflictingBlocks(
    roomNumbers: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<RoomBlock[]> {
    const documents = await this.roomBlockModel
      .find({
        status: 'active',
        roomNumbers: { $in: roomNumbers },
        $or: [
          {
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
        ],
      })
      .exec();

    return documents.map((doc) => this.toDomainEntity(doc));
  }
  async updateStatus(id: string, status: RoomBlockStatus): Promise<RoomBlock> {
    const document = await this.roomBlockModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!document) {
      throw new Error(`RoomBlock with ID ${id} not found`);
    }

    return this.toDomainEntity(document);
  }

  private toDomainEntity(document: RoomBlockDocument): RoomBlock {
    return new RoomBlock(
      document._id.toString(),
      document.blockName,
      document.companyName || null,
      document.eventName || null,
      document.roomNumbers,
      document.startDate,
      document.endDate,
      document.status as RoomBlockStatus,
      document.createdBy,
      document.notes || null,
      document.numberOfRooms,
      document.cutoffDate || null,
      (document as any).createdAt || new Date(),
      (document as any).updatedAt || new Date(),
    );
  }
}
