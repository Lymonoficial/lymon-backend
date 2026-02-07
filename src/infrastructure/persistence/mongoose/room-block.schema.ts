import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RoomBlockDocument extends Document {
  @Prop({ required: true })
  blockName: string;

  @Prop()
  companyName: string;

  @Prop()
  eventName: string;

  @Prop({ type: [String], required: true, index: true })
  roomNumbers: string[];

  @Prop({ required: true, type: Date, index: true })
  startDate: Date;

  @Prop({ required: true, type: Date, index: true })
  endDate: Date;

  @Prop({
    enum: ['active', 'released', 'expired', 'cancelled'],
    default: 'active',
    index: true,
  })
  status: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop()
  notes: string;

  @Prop({ required: true })
  numberOfRooms: number;

  @Prop({ type: Date })
  cutoffDate: Date;
}

export const RoomBlockSchema =
  SchemaFactory.createForClass(RoomBlockDocument);

// Compound indexes for query performance
RoomBlockSchema.index({ startDate: 1, endDate: 1 });
RoomBlockSchema.index({ roomNumbers: 1, status: 1 });
RoomBlockSchema.index({ status: 1, endDate: 1 });
RoomBlockSchema.index({ companyName: 1 });
