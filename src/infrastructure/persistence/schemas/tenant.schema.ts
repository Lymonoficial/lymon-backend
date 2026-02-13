import { PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'tenants', timestamps: true })
export class TenantDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  ownerEmail: string;

  @Prop({ required: true, enum: PlanTypeEnum })
  plan: string;

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TenantSchema = SchemaFactory.createForClass(TenantDocument);

TenantSchema.index({ ownerEmail: 1 });
