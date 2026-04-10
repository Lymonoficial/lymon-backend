import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'suppliers', timestamps: true })
export class SupplierDocument extends Document {
  createdAt!: Date;
  updatedAt!: Date;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  contactEmail!: string;

  @Prop({ required: true })
  contactPhone!: string;

  @Prop({ required: true })
  country!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  nit!: string;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const SupplierSchema = SchemaFactory.createForClass(SupplierDocument);

SupplierSchema.index({ tenantId: 1, nit: 1 }, { unique: true });
