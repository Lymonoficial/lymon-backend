import { GuestPreferenceCategoryEnum } from '@/domain/guest-preference/value-objects/guest-preference-category.vo';
import { GuestPreferencePredefinedKeyEnum } from '@/domain/guest-preference/value-objects/guest-preference-predefined-key.vo';
import { GuestPreferenceSourceEnum } from '@/domain/guest-preference/entities/guest-preference-catalog-item.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'guest_preference_catalog_items', timestamps: true })
export class GuestPreferenceCatalogItemDocument extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, enum: GuestPreferenceCategoryEnum })
  category: string;

  @Prop({ required: true, enum: GuestPreferenceSourceEnum })
  source: string;

  @Prop({ type: String, enum: GuestPreferencePredefinedKeyEnum, default: null })
  key: string | null;

  @Prop({ type: String, default: null })
  label: string | null;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const GuestPreferenceCatalogItemSchema = SchemaFactory.createForClass(
  GuestPreferenceCatalogItemDocument,
);

GuestPreferenceCatalogItemSchema.index({ tenantId: 1, category: 1 });
GuestPreferenceCatalogItemSchema.index({ tenantId: 1, source: 1 });
GuestPreferenceCatalogItemSchema.index(
  { tenantId: 1, key: 1 },
  { sparse: true },
);
