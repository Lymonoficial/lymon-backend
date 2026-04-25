import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'shifts', timestamps: true })
export class ShiftDocument extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({
    type: [Types.ObjectId],
    ref: 'UserDocument',
    required: true,
    index: true,
  })
  staffMemberIds!: Types.ObjectId[];

  @Prop({
    type: Types.ObjectId,
    ref: 'UserDocument',
    required: false,
    index: true,
  })
  staffMemberId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'PropertyDocument',
    required: true,
    index: true,
  })
  propertyId!: Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  startDate!: Date;

  @Prop({ type: Date, default: null, index: true })
  endDate!: Date | null;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Date, required: false, index: true })
  shiftDate?: Date;

  @Prop({ type: String, required: true })
  startHour!: string;

  @Prop({ type: String, required: true })
  endHour!: string;

  @Prop({ type: String, required: false })
  startTime?: string;

  @Prop({ type: String, required: false })
  endTime?: string;

  @Prop({ type: Number, required: true })
  startMinutes!: number;

  @Prop({ type: Number, required: true })
  endMinutes!: number;

  @Prop({ type: String, default: null })
  notes!: string | null;

  @Prop({ type: String, default: null })
  createdBy!: string | null;

  @Prop({ type: String, default: null })
  createdByEmail!: string | null;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const ShiftSchema = SchemaFactory.createForClass(ShiftDocument);

ShiftSchema.index({ tenantId: 1, staffMemberIds: 1, startDate: 1, endDate: 1 });
