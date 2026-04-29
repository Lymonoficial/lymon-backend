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

  @Prop({ type: String, default: null })
  contactPhone: string | null;

  @Prop({ type: String, default: null })
  address: string | null;

  @Prop({ type: String, default: null })
  website: string | null;

  @Prop({ type: String, default: null })
  logoUrl: string | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const TenantSchema = SchemaFactory.createForClass(TenantDocument);

TenantSchema.index({ ownerEmail: 1, deletedAt: 1 }, { unique: true });
