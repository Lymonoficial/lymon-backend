import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type RoleDocumentType = HydratedDocument<RoleDocument>;

@Schema({ collection: 'roles', timestamps: true })
export class RoleDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], required: true, default: [] })
  permissions: string[];

  @Prop({ required: true, default: true })
  isSystem: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(RoleDocument);

RoleSchema.index({ name: 1 }, { unique: true });
