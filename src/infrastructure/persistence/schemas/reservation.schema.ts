import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'reservations', timestamps: true })
export class ReservationDocument extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'PropertyDocument',
    required: true,
    index: true,
  })
  propertyId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'UnitDocument',
    required: true,
    index: true,
  })
  unitId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'GuestDocument',
    required: true,
    index: true,
  })
  guestId: Types.ObjectId;

  @Prop({ required: true })
  checkIn: Date;

  @Prop({ required: true })
  checkOut: Date;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  guestsCount: number;

  @Prop({ required: true })
  pricePerNight: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ type: String, default: null })
  notes: string | null;

  @Prop({ type: String, default: undefined })
  externalReservationId?: string;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: String, default: null })
  cancellationReason: string | null;

  @Prop({ type: Date, default: null })
  checkInActualAt: Date | null;

  @Prop({ type: Date, default: null })
  checkOutActualAt: Date | null;
}

export const ReservationSchema =
  SchemaFactory.createForClass(ReservationDocument);

ReservationSchema.index({ unitId: 1, checkIn: 1, checkOut: 1, status: 1 });
ReservationSchema.index({ tenantId: 1, createdAt: -1 });
ReservationSchema.index({ guestId: 1, checkIn: -1, createdAt: -1, status: 1 });
ReservationSchema.index(
  { externalReservationId: 1, source: 1 },
  {
    unique: true,
    // Only index documents where externalReservationId is present and not null.
    partialFilterExpression: {
      externalReservationId: { $exists: true, $ne: null },
    },
  },
);
