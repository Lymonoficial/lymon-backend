import { PropertyTypeEnum } from '@/domain/property/value-objects/property-type.vo';
import { CancellationPolicyEnum } from '@/domain/property/value-objects/cancellation-policy.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'properties', timestamps: true })
export class PropertyDocument extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: PropertyTypeEnum })
  propertyType: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    required: true,
  })
  location: {
    lat: number;
    lng: number;
  };

  @Prop({ required: true })
  checkInTime: string;

  @Prop({ required: true })
  checkOutTime: string;

  @Prop({ required: true, enum: CancellationPolicyEnum })
  cancellationPolicy: string;

  @Prop({ required: true })
  hostPhone: string;

  @Prop({ required: true })
  hostEmail: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const PropertySchema = SchemaFactory.createForClass(PropertyDocument);

PropertySchema.index({ tenantId: 1, deletedAt: 1, createdAt: -1 });
