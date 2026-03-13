import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'inventory_movements', timestamps: true })
export class InventoryMovementDocument extends Document {
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

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  itemId: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  reason: string;

  @Prop({ type: String, default: null })
  reference: string | null;

  @Prop({ required: true })
  actorId: string;

  @Prop({ required: true })
  actorEmail: string;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(
  InventoryMovementDocument,
);

InventoryMovementSchema.index({ tenantId: 1, propertyId: 1, createdAt: -1 });
InventoryMovementSchema.index({ tenantId: 1, itemId: 1, createdAt: -1 });
