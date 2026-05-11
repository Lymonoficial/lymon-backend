import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'guest_tags', timestamps: true })
export class GuestTagDocument extends Document {
  @Prop({ type: String, required: true, index: true })
  tenantId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const GuestTagSchema = SchemaFactory.createForClass(GuestTagDocument);

GuestTagSchema.index({ tenantId: 1, name: 1 }, { unique: true });
