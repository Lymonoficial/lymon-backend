import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'inventory_items', timestamps: true })
export class InventoryItemDocument extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  propertyId: Types.ObjectId;

  @Prop({ required: true })
  sku: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  minStock: number;

  @Prop({ required: true, default: 0 })
  currentStock: number;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  supplierId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const InventoryItemSchema = SchemaFactory.createForClass(
  InventoryItemDocument,
);

InventoryItemSchema.index(
  { tenantId: 1, propertyId: 1, sku: 1 },
  { unique: true },
);
InventoryItemSchema.index({ tenantId: 1, supplierId: 1 });
InventoryItemSchema.index({
  tenantId: 1,
  propertyId: 1,
  currentStock: 1,
  minStock: 1,
});
