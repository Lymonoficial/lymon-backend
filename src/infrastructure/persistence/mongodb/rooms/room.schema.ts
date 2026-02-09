import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'rooms', timestamps: true })
export class RoomDocument extends Document {
  @Prop({ required: true })
  roomTypeId: string;

  @Prop({ required: true })
  hotelId: string;

  @Prop({ required: true })
  roomNumber: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  floor: number;

  @Prop({
    required: true,
    enum: ['available', 'occupied', 'maintenance', 'out_of_service'],
    default: 'available',
  })
  status: string;

  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop()
  image?: string;

  @Prop({ type: [String], default: [] })
  amenities?: string[];

  @Prop()
  description?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(RoomDocument);

// Create compound unique index for hotelId + roomNumber
RoomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });
