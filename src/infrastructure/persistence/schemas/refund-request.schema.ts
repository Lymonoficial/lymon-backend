import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'refund_requests', timestamps: true })
export class RefundRequestDocument extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ReservationDocument', required: true })
  reservationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GuestDocument', required: true })
  guestId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({
    type: String,
    required: true,
    enum: ['PENDING', 'APPROVED', 'DENIED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ type: String, required: true, default: 'guest' })
  requestedBy: string;

  @Prop({ type: String, default: null })
  reviewedBy: string | null;

  @Prop({ type: Date, default: null })
  reviewedAt: Date | null;

  @Prop({ type: String, default: null })
  reason: string | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RefundRequestSchema = SchemaFactory.createForClass(
  RefundRequestDocument,
);

RefundRequestSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
RefundRequestSchema.index({ reservationId: 1 });
