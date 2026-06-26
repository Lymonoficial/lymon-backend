import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'experience_purchases', timestamps: true })
export class ExperiencePurchaseDocument extends Document {
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
    ref: 'GuestAccountDocument',
    required: true,
    index: true,
  })
  guestAccountId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ExperienceDocument',
    required: true,
    index: true,
  })
  experienceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ReservationDocument', default: null })
  reservationId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  selectedDate: Date | null;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPriceCop: number;

  @Prop({ required: true })
  totalPriceCop: number;

  @Prop({ required: true })
  status: string;

  @Prop({ type: String, default: null })
  paymentReference: string | null;
}

export const ExperiencePurchaseSchema = SchemaFactory.createForClass(
  ExperiencePurchaseDocument,
);

ExperiencePurchaseSchema.index({
  guestAccountId: 1,
  tenantId: 1,
  createdAt: -1,
});
ExperiencePurchaseSchema.index({ tenantId: 1, createdAt: -1 });
ExperiencePurchaseSchema.index({ tenantId: 1, selectedDate: 1, status: 1 });
ExperiencePurchaseSchema.index({ experienceId: 1, selectedDate: 1, status: 1 });
