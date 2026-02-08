import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RoomTypeDocument extends Document {
  @Prop({ required: true })
  hotelId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop({ required: true, min: 1 })
  maxOccupancy: number;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RoomTypeSchema = SchemaFactory.createForClass(RoomTypeDocument);
