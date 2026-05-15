import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'inventory_item_categories', timestamps: true })
export class InventoryItemCategoryDocument extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, default: null })
  description: string | null;
}

export const InventoryItemCategorySchema = SchemaFactory.createForClass(
  InventoryItemCategoryDocument,
);

InventoryItemCategorySchema.index(
  { tenantId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);
