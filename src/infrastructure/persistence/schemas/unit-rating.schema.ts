import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'unit_ratings', timestamps: true })
export class UnitRatingDocument extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

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

  @Prop({
    type: Types.ObjectId,
    ref: 'ReservationDocument',
    required: true,
    unique: true,
  })
  reservationId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rate: number;

  @Prop({ type: String, default: null })
  message: string | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const UnitRatingSchema = SchemaFactory.createForClass(UnitRatingDocument);

UnitRatingSchema.index({ unitId: 1, deletedAt: 1, createdAt: -1 });
UnitRatingSchema.index({ guestId: 1, createdAt: -1 });
