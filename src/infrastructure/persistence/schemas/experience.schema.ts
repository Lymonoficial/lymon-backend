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

  @Prop({
    required: true,
    enum: ExperienceScopeEnum,
    default: ExperienceScopeEnum.GLOBAL,
    index: true,
  })
  scope: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, maxlength: 5000 })
  description: string;

  @Prop({ required: true, index: true })
  city: string;

  @Prop({ required: true, enum: ExperienceCategoryEnum })
  category: string;

  @Prop({ required: true })
  priceCop: number;

  @Prop({ type: Number, default: null })
  durationHours: number | null;

  @Prop({ required: true, default: 1 })
  minimumParticipants: number;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true, enum: ExperienceAvailabilityTypeEnum })
  availabilityType: string;

  @Prop({ type: ExperienceRecurrenceSchema, default: null })
  recurrence: ExperienceRecurrenceSchema | null;

  @Prop({ required: true, default: true })
  allowStandalonePurchase: boolean;

  @Prop({ required: true, default: true })
  allowReservationPurchase: boolean;

  @Prop({ type: [String], required: true, default: [] })
  mediaKeys: string[];

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
