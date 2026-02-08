import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomType } from '@/domain/rooms/entities/room-type.entity';
import { RoomTypeRepository } from '@/domain/rooms/repositories/room-type.repository';
import { RoomTypeDocument } from '../schemas/room-type.schema';

@Injectable()
export class MongooseRoomTypeRepository implements RoomTypeRepository {
  constructor(
    @InjectModel('RoomType')
    private readonly roomTypeModel: Model<RoomTypeDocument>,
  ) {}

  async findById(id: string): Promise<RoomType | null> {
    const doc = await this.roomTypeModel.findById(id).exec();
    if (!doc) return null;

    return new RoomType(
      doc._id.toString(),
      doc.hotelId,
      doc.name,
      doc.description,
      doc.basePrice,
      doc.maxOccupancy,
      doc.amenities,
      doc.createdAt,
    );
  }

  async findByHotelId(hotelId: string): Promise<RoomType[]> {
    const docs = await this.roomTypeModel.find({ hotelId }).exec();

    return docs.map(
      (doc) =>
        new RoomType(
          doc._id.toString(),
          doc.hotelId,
          doc.name,
          doc.description,
          doc.basePrice,
          doc.maxOccupancy,
          doc.amenities,
          doc.createdAt,
        ),
    );
  }

  async save(roomType: any): Promise<RoomType> {
    const created = new this.roomTypeModel(roomType);
    const saved = await created.save();

    return new RoomType(
      saved._id.toString(),
      saved.hotelId,
      saved.name,
      saved.description,
      saved.basePrice,
      saved.maxOccupancy,
      saved.amenities,
      saved.createdAt,
    );
  }

  async update(id: string, roomType: Partial<RoomType>): Promise<void> {
    await this.roomTypeModel.findByIdAndUpdate(id, roomType).exec();
  }

  async delete(id: string): Promise<void> {
    await this.roomTypeModel.findByIdAndDelete(id).exec();
  }
}
