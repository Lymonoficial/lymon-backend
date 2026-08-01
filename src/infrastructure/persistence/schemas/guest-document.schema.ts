import { GuestDocumentTypeEnum } from '@/domain/guest-document/value-objects/guest-document-type.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Files attached to a guest profile (ID, passport, visa, registration card...).
 * Named `GuestDocumentFileDocument` because `GuestDocument` is already the
 * mongoose class of the `guests` collection.
 *
 * Only the R2 object key is stored — these live in the private documents
 * bucket and are served through short-lived presigned GET URLs.
 */
@Schema({ collection: 'guest_documents', timestamps: true })
export class GuestDocumentFileDocument extends Document {
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
  key: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(GuestDocumentTypeEnum),
    default: GuestDocumentTypeEnum.OTHER,
  })
  type: GuestDocumentTypeEnum;

  @Prop({ type: String, required: true })
  fileName: string;

  @Prop({ type: String, required: true })
  mimeType: string;

  @Prop({ type: Number, required: true })
  sizeBytes: number;

  @Prop({ type: String, default: null })
  documentNumber: string | null;

  // ISO-3166 alpha-2
  @Prop({
    type: String,
    default: null,
    uppercase: true,
    minlength: 2,
    maxlength: 2,
  })
  issuingCountry: string | null;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({ type: String, default: null })
  notes: string | null;

  @Prop({ type: String, required: true })
  uploadedBy: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const GuestDocumentFileSchema = SchemaFactory.createForClass(
  GuestDocumentFileDocument,
);

GuestDocumentFileSchema.index({ tenantId: 1, guestId: 1, createdAt: -1 });
