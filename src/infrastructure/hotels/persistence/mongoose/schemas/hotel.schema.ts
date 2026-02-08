import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'hotels', timestamps: true })
export class HotelDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  subdomain: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'UserDocument' })
  userId: Types.ObjectId;

  @Prop()
  location?: string;

  @Prop()
  image?: string;

  @Prop()
  primaryColor?: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const HotelSchema = SchemaFactory.createForClass(HotelDocument);
