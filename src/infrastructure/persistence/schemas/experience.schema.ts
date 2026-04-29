import { ExperienceAvailabilityTypeEnum } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategoryEnum } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceScopeEnum } from '@/domain/experience/value-objects/experience-scope.vo';
import { ExperienceStatusEnum } from '@/domain/experience/value-objects/experience-status.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class ExperienceRecurrenceSchema {
  @Prop({ type: [Number], required: true })
  daysOfWeek: number[];

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;
}

@Schema({ _id: false })
class ExperienceBlackoutRangeSchema {
  @Prop({ type: Date, required: true })
  startAt: Date;

  @Prop({ type: Date, required: true })
  endAt: Date;
}

@Schema({ _id: false })
class ExperienceLocationSchema {
  @Prop({ required: true })
  label: string;

  @Prop()
  address?: string;

  @Prop({ type: Number, required: true })
  lat: number;

  @Prop({ type: Number, required: true })
  lng: number;
}

@Schema({ collection: 'experiences', timestamps: true })
export class ExperienceDocument extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'PropertyDocument',
    default: null,
    index: true,
  })
  propertyId: Types.ObjectId | null;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'UnitDocument' }], default: [] })
  unitIds: Types.ObjectId[];

  @Prop({ required: true, enum: ExperienceScopeEnum })
  scope: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, maxlength: 5000 })
  description: string;

  @Prop({ required: true, enum: ExperienceCategoryEnum })
  category: string;

  @Prop({ required: true })
  priceCop: number;

  @Prop({ required: true })
  durationHours: number;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  coverImageUrl: string;

  @Prop({ type: ExperienceLocationSchema, required: true })
  location: ExperienceLocationSchema;

  @Prop({ required: true, enum: ExperienceAvailabilityTypeEnum })
  availabilityType: string;

  @Prop({ type: Date, default: null })
  startAt: Date | null;

  @Prop({ type: Date, default: null })
  endAt: Date | null;

  @Prop({ type: ExperienceRecurrenceSchema, default: null })
  recurrence: ExperienceRecurrenceSchema | null;

  @Prop({ type: [ExperienceBlackoutRangeSchema], default: [] })
  blackoutRanges: ExperienceBlackoutRangeSchema[];

  @Prop({ required: true, default: true })
  allowStandalonePurchase: boolean;

  @Prop({ required: true, default: true })
  allowReservationPurchase: boolean;

  @Prop({ required: true, default: 2 })
  minNoticeHours: number;

  @Prop({ required: true, default: 24 })
  purchaseCutoffHours: number;

  @Prop({
    required: true,
    enum: ExperienceStatusEnum,
    default: ExperienceStatusEnum.ACTIVE,
  })
  status: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const ExperienceSchema =
  SchemaFactory.createForClass(ExperienceDocument);

ExperienceSchema.index({ tenantId: 1, propertyId: 1, createdAt: -1 });
ExperienceSchema.index({ propertyId: 1, name: 1, deletedAt: 1 });
