import { GuestStatusEnum } from '@/domain/guest/entities/guest.types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'guests', timestamps: true })
export class GuestDocument extends Document {
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
    required: false,
    default: null,
  })
  guestAccountId: Types.ObjectId | null;

  @Prop({
    type: {
      documentType: { type: String },
      documentNumber: { type: String },
      countryCode: { type: String },
    },
    default: {},
  })
  identity: {
    documentType?: string;
    documentNumber?: string;
    countryCode?: string;
  };

  @Prop({ type: String, default: null })
  firstName: string | null;

  @Prop({ type: String, default: null })
  lastName: string | null;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  primaryEmail: string;

  @Prop({ type: String, default: null })
  phone: string | null;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GuestStatusEnum),
    default: GuestStatusEnum.ACTIVE,
  })
  status: GuestStatusEnum;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'GuestTagDocument' }],
    default: [],
  })
  tags: Types.ObjectId[];

  @Prop({
    type: [
      {
        catalogItemId: { type: String, required: true },
        labelSnapshot: { type: String, required: true },
        category: { type: String, required: true },
      },
    ],
    default: [],
  })
  preferences: Array<{
    catalogItemId: string;
    labelSnapshot: string;
    category: string;
  }>;

  @Prop({
    type: {
      totalBookings: { type: Number, required: true, min: 0, default: 0 },
      totalNights: { type: Number, required: true, min: 0, default: 0 },
      totalSpend: { type: Number, required: true, min: 0, default: 0 },
      lastStayAt: { type: Date, default: null },
      lastPropertyId: {
        type: Types.ObjectId,
        ref: 'PropertyDocument',
        default: null,
      },
      lastUnitId: { type: Types.ObjectId, ref: 'UnitDocument', default: null },
    },
    required: true,
  })
  summary: {
    totalBookings: number;
    totalNights: number;
    totalSpend: number;
    lastStayAt: Date | null;
    lastPropertyId: Types.ObjectId | null;
    lastUnitId: Types.ObjectId | null;
  };

  @Prop({ type: String, default: null })
  pendingEmail: string | null;

  @Prop({ type: String, default: null })
  emailChangeToken: string | null;

  @Prop({ type: Date, default: null })
  emailChangeExpiry: Date | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const GuestSchema = SchemaFactory.createForClass(GuestDocument);

GuestSchema.index({ tenantId: 1, createdAt: -1 });
GuestSchema.index({ tenantId: 1, primaryEmail: 1 });
GuestSchema.index(
  { tenantId: 1, 'identity.documentNumber': 1 },
  { sparse: true },
);
GuestSchema.index({ tenantId: 1, guestAccountId: 1 }, { sparse: true });
GuestSchema.index({ emailChangeToken: 1 }, { sparse: true });
