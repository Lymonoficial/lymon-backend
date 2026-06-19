import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'payment_sessions', timestamps: true })
export class PaymentSessionDocument extends Document {
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
    ref: 'CartDocument',
    required: true,
    index: true,
  })
  cartId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  reference: string;

  @Prop({ required: true })
  amountInCents: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop({ required: true })
  signatureIntegrity: string;

  @Prop({ type: String, default: null })
  redirectUrl: string | null;

  @Prop({ type: Date, default: null })
  expirationTime: Date | null;

  @Prop({ type: String, default: null, index: true })
  providerReference: string | null;

  @Prop({ required: true, index: true })
  status: string;
}

export const PaymentSessionSchema = SchemaFactory.createForClass(
  PaymentSessionDocument,
);

PaymentSessionSchema.index({ cartId: 1, status: 1, createdAt: -1 });
PaymentSessionSchema.index(
  { providerReference: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerReference: { $exists: true, $ne: null },
    },
  },
);
