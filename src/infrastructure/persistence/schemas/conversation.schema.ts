import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { GuestMessageChannel } from '@/domain/guest-message/value-objects/guest-message-channel.vo';
import { ConversationStatus } from '@/domain/conversation/value-objects/conversation-status.vo';

@Schema({ collection: 'conversations', timestamps: true })
export class ConversationDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ type: Types.ObjectId, ref: 'TenantDocument', required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GuestDocument', required: true, index: true })
  guestId: Types.ObjectId;

  @Prop({ type: String, default: null })
  reservationId: string | null;

  @Prop({ type: [String], enum: Object.values(GuestMessageChannel), default: [] })
  channels: GuestMessageChannel[];

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: Date, required: true })
  lastMessageAt: Date;

  @Prop({ type: String, default: '' })
  lastMessagePreview: string;

  @Prop({ type: Number, default: 0 })
  unreadCountForStaff: number;

  @Prop({ type: Number, default: 0 })
  unreadCountForGuest: number;

  @Prop({ type: String, enum: Object.values(ConversationStatus), default: ConversationStatus.OPEN })
  status: ConversationStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(ConversationDocument);

ConversationSchema.index({ tenantId: 1, guestId: 1 }, { unique: true });
ConversationSchema.index({ tenantId: 1, status: 1, lastMessageAt: -1 });
ConversationSchema.index({ tenantId: 1, unreadCountForStaff: 1 });
