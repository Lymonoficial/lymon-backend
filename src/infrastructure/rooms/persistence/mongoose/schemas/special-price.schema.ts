import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'special_prices', timestamps: true })
export class SpecialPriceDocument extends Document {
  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true })
  hotelId: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  description?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SpecialPriceSchema = SchemaFactory.createForClass(SpecialPriceDocument);

// Índice para búsquedas por habitación y fechas
SpecialPriceSchema.index({ roomId: 1, startDate: 1, endDate: 1 });
SpecialPriceSchema.index({ hotelId: 1 });
