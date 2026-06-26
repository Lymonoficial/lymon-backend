import { GuestMessageChannel } from '@/domain/guest-message/value-objects/guest-message-channel.vo';
import { GuestMessageDirection } from '@/domain/guest-message/value-objects/guest-message-direction.vo';
import { GuestMessageStatus } from '@/domain/guest-message/value-objects/guest-message-status.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'guest_messages', timestamps: true })
export class GuestMessageDocument {
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

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GuestMessageChannel),
  })
  channel: GuestMessageChannel;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GuestMessageDirection),
  })
  direction: GuestMessageDirection;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GuestMessageStatus),
    default: GuestMessageStatus.PENDING,
  })
  status: GuestMessageStatus;

  @Prop({ type: String, default: '' })
  from: string;

  @Prop({ type: [String], default: [] })
  to: string[];

  @Prop({ type: String, required: false, default: null })
  reservationId: string | null;

  @Prop({ type: String, required: false, default: null })
  provider: string | null;

  @Prop({ type: String, required: false, default: null, index: true })
  providerMessageId: string | null;

  @Prop({ type: String, required: false, default: null })
  templateId: string | null;

  @Prop({
    type: {
      actorId: { type: String, required: true },
      actorEmail: { type: String, required: true },
    },
    required: true,
  })
  sentBy: { actorId: string; actorEmail: string };

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

  @Prop({ type: String, required: false, default: null })
  preview: string | null;

  @Prop({ type: String, required: false, default: null })
  body: string | null;

  @Prop({ type: String, required: false, default: null })
  bodyHtml: string | null;

  @Prop({ type: String, required: false, default: null })
  failureReason: string | null;

  @Prop({ type: String, required: false, default: null })
  conversationId: string | null;

  @Prop({ type: Boolean, default: false })
  migratedFromGuestEmail: boolean;

  @Prop({ type: Date, required: false, default: null })
  deletedAt: Date | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const GuestMessageSchema = SchemaFactory.createForClass(GuestMessageDocument);

GuestMessageSchema.index({ tenantId: 1, guestId: 1, createdAt: -1 });
GuestMessageSchema.index({ status: 1, channel: 1 });
GuestMessageSchema.index({ tenantId: 1, conversationId: 1 });
