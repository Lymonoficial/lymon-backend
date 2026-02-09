import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel } from '@/domain/hotels/entities/hotel.entity';
import { HotelRepository } from '@/domain/hotels/repositories/hotel.repository';
import { HotelDocument } from './hotel.schema';

@Injectable()
export class MongooseHotelRepository implements HotelRepository {
  constructor(
    @InjectModel('Hotel')
    private readonly hotelModel: Model<HotelDocument>,
  ) {}

  async findBySubdomain(subdomain: string): Promise<Hotel | null> {
    const hotelDoc = await this.hotelModel
      .findOne({ subdomain: subdomain.toLowerCase() })
      .exec();

    if (!hotelDoc) {
      return null;
    }

    return new Hotel(
      hotelDoc._id.toString(),
      hotelDoc.name,
      hotelDoc.subdomain,
      hotelDoc.userId.toString(),
      hotelDoc.location,
      hotelDoc.image,
      hotelDoc.primaryColor,
      hotelDoc.description,
      hotelDoc.createdAt,
    );
  }

  async save(hotel: Hotel): Promise<void> {
    const hotelData = {
      name: hotel.name,
      subdomain: hotel.subdomain.toLowerCase(),
      userId: hotel.userId,
      location: hotel.location,
      image: hotel.image,
      primaryColor: hotel.primaryColor,
      description: hotel.description,
      createdAt: hotel.createdAt,
      isActive: true,
    };

    const createdHotel = new this.hotelModel(hotelData);
    await createdHotel.save();
  }
}
