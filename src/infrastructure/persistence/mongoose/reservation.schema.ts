import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ReservationDocument extends Document {
  @Prop({ required: true }) guestName: string;
  @Prop({ required: true }) guestEmail: string;
  @Prop({ required: true }) guestPhone: string;
  @Prop({ required: true }) roomNumber: string;
  @Prop({ required: true, type: Date }) checkInDate: Date;
  @Prop({ required: true, type: Date }) checkOutDate: Date;
  @Prop({
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    default: 'pending',
  })
  status: string;
  @Prop({ required: true }) numberOfGuests: number;
}

export const ReservationSchema =
  SchemaFactory.createForClass(ReservationDocument);

// // Add indexes for query performance
// ReservationSchema.index({ checkInDate: 1, checkOutDate: 1 });
// ReservationSchema.index({ roomNumber: 1 });
// ReservationSchema.index({ guestEmail: 1 });
