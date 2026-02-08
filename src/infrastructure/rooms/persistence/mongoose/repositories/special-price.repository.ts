import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SpecialPrice } from '@/domain/rooms/entities/special-price.entity';
import { SpecialPriceRepository } from '@/domain/rooms/repositories/special-price.repository';
import { SpecialPriceDocument } from '../schemas/special-price.schema';

@Injectable()
export class MongooseSpecialPriceRepository implements SpecialPriceRepository {
  constructor(
    @InjectModel('SpecialPrice')
    private readonly specialPriceModel: Model<SpecialPriceDocument>,
  ) {}

  async create(specialPrice: SpecialPrice): Promise<SpecialPrice> {
    const created = new this.specialPriceModel({
      roomId: specialPrice.roomId,
      hotelId: specialPrice.hotelId,
      startDate: specialPrice.startDate,
      endDate: specialPrice.endDate,
      price: specialPrice.price,
      description: specialPrice.description,
      createdAt: specialPrice.createdAt,
    });

    const saved = await created.save();
    return this.mapToEntity(saved);
  }

  async findById(id: string): Promise<SpecialPrice | null> {
    const doc = await this.specialPriceModel.findById(id).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByRoomId(roomId: string): Promise<SpecialPrice[]> {
    const docs = await this.specialPriceModel.find({ roomId }).exec();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findByHotelId(hotelId: string): Promise<SpecialPrice[]> {
    const docs = await this.specialPriceModel.find({ hotelId }).exec();
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findActiveForDate(roomId: string, date: Date): Promise<SpecialPrice | null> {
    const doc = await this.specialPriceModel
      .findOne({
        roomId,
        startDate: { $lte: date },
        endDate: { $gte: date },
      })
      .exec();

    return doc ? this.mapToEntity(doc) : null;
  }

  async update(id: string, data: Partial<SpecialPrice>): Promise<SpecialPrice | null> {
    const updated = await this.specialPriceModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updated ? this.mapToEntity(updated) : null;
  }

  async delete(id: string): Promise<void> {
    await this.specialPriceModel.findByIdAndDelete(id).exec();
  }

  private mapToEntity(doc: SpecialPriceDocument): SpecialPrice {
    return new SpecialPrice(
      doc._id.toString(),
      doc.roomId,
      doc.hotelId,
      doc.startDate,
      doc.endDate,
      doc.price,
      doc.description,
      doc.createdAt,
    );
  }
}
