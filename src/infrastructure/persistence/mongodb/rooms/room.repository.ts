import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomStatus } from '@/domain/rooms/entities/room.entity';
import { RoomRepository } from '@/domain/rooms/repositories/room.repository';
import { RoomDocument } from './room.schema';

@Injectable()
export class MongooseRoomRepository implements RoomRepository {
  constructor(
    @InjectModel('Room')
    private readonly roomModel: Model<RoomDocument>,
  ) {}

  async findById(id: string): Promise<Room | null> {
    const doc = await this.roomModel.findById(id).exec();
    if (!doc) return null;

    return new Room(
      doc._id.toString(),
      doc.roomTypeId,
      doc.hotelId,
      doc.roomNumber,
      doc.name,
      doc.floor,
      doc.status as RoomStatus,
      doc.basePrice,
      doc.image,
      doc.amenities,
      doc.description,
      doc.createdAt,
    );
  }

  async findByRoomTypeId(roomTypeId: string): Promise<Room[]> {
    const docs = await this.roomModel.find({ roomTypeId }).exec();

    return docs.map(
      (doc) =>
        new Room(
          doc._id.toString(),
          doc.roomTypeId,
          doc.hotelId,
          doc.roomNumber,
          doc.name,
          doc.floor,
          doc.status as RoomStatus,
          doc.basePrice,
          doc.image,
          doc.amenities,
          doc.description,
          doc.createdAt,
        ),
    );
  }

  async findByHotelId(hotelId: string): Promise<Room[]> {
    const docs = await this.roomModel.find({ hotelId }).exec();

    return docs.map(
      (doc) =>
        new Room(
          doc._id.toString(),
          doc.roomTypeId,
          doc.hotelId,
          doc.roomNumber,
          doc.name,
          doc.floor,
          doc.status as RoomStatus,
          doc.basePrice,
          doc.image,
          doc.amenities,
          doc.description,
          doc.createdAt,
        ),
    );
  }

  async findByRoomNumber(
    hotelId: string,
    roomNumber: string,
  ): Promise<Room | null> {
    const doc = await this.roomModel.findOne({ hotelId, roomNumber }).exec();
    if (!doc) return null;

    return new Room(
      doc._id.toString(),
      doc.roomTypeId,
      doc.hotelId,
      doc.roomNumber,
      doc.name,
      doc.floor,
      doc.status as RoomStatus,
      doc.basePrice,
      doc.image,
      doc.amenities,
      doc.description,
      doc.createdAt,
    );
  }

  async save(room: any): Promise<Room> {
    const created = new this.roomModel(room);
    const saved = await created.save();

    return new Room(
      saved._id.toString(),
      saved.roomTypeId,
      saved.hotelId,
      saved.roomNumber,
      saved.name,
      saved.floor,
      saved.status as RoomStatus,
      saved.basePrice,
      saved.image,
      saved.amenities,
      saved.description,
      saved.createdAt,
    );
  }

  async saveMany(rooms: any[]): Promise<Room[]> {
    const created = await this.roomModel.insertMany(rooms);

    return created.map(
      (doc) =>
        new Room(
          doc._id.toString(),
          doc.roomTypeId,
          doc.hotelId,
          doc.roomNumber,
          doc.name,
          doc.floor,
          doc.status as RoomStatus,
          doc.basePrice,
          doc.image,
          doc.amenities,
          doc.description,
          doc.createdAt,
        ),
    );
  }

  async update(id: string, room: Partial<Room>): Promise<void> {
    await this.roomModel.findByIdAndUpdate(id, room).exec();
  }

  async delete(id: string): Promise<void> {
    await this.roomModel.findByIdAndDelete(id).exec();
  }
}
