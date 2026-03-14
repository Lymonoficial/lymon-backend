import { GuestNoteTypeEnum } from '@/domain/guest-note/value-objects/guest-node-type.vo';
import { GuestNoteStatusEnum } from '@/domain/guest-note/value-objects/guest-node-status.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'guest_notes', timestamps: true })
export class GuestNoteDocument extends Document {
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
  note: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GuestNoteTypeEnum),
    default: GuestNoteTypeEnum.GENERAL,
  })
  type: GuestNoteTypeEnum;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GuestNoteStatusEnum),
    default: GuestNoteStatusEnum.NOT_PINNED,
  })
  status: GuestNoteStatusEnum;

  @Prop({
    type: String,
    required: true,
  })
  createdBy: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const GuestNoteSchema = SchemaFactory.createForClass(GuestNoteDocument);

GuestNoteSchema.index({ tenantId: 1, guestId: 1, createdAt: -1 });
