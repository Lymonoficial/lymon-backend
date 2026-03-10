import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'incident_reports', timestamps: true })
export class IncidentReportDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
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
    required: true,
    index: true,
  })
  propertyId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'UserDocument',
    required: true,
    index: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  attachmentUrls: string[];

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const IncidentReportSchema = SchemaFactory.createForClass(
  IncidentReportDocument,
);

IncidentReportSchema.index({ tenantId: 1, propertyId: 1, createdAt: -1 });
IncidentReportSchema.index({ tenantId: 1, createdBy: 1, createdAt: -1 });
