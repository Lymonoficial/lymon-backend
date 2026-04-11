import { GuestEmailStatusEnum } from '@/domain/guest-email/value-objects/guest-email-status.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'guest_emails', timestamps: true })
export class GuestEmailDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'GuestDocument',
    required: true,
    index: true,
  })
  guestId: Types.ObjectId;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GuestEmailStatusEnum),
    default: GuestEmailStatusEnum.PENDING,
  })
  status: GuestEmailStatusEnum;

  @Prop({
    type: String,
    required: false,
    default: null,
    index: true,
  })
  messageId: string | null;

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String },
      },
    ],
    default: [],
  })
  attachments: { url: string; name: string; type?: string }[];

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  sentById: string | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const GuestEmailSchema =
  SchemaFactory.createForClass(GuestEmailDocument);

GuestEmailSchema.index({ tenantId: 1, guestId: 1, createdAt: -1 });
GuestEmailSchema.index({ status: 1, createdAt: 1 });
