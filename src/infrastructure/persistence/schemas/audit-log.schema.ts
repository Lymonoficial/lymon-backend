import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type AuditLogDocumentType = HydratedDocument<AuditLogDocument>;

@Schema({ collection: 'audit_logs', timestamps: false })
export class AuditLogDocument extends Document {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  entityType: string;

  @Prop()
  entityId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ type: Object })
  previousValue?: Record<string, unknown>;

  @Prop({ type: Object })
  newValue?: Record<string, unknown>;

  @Prop()
  ipAddress?: string;

  @Prop({ required: true, default: () => new Date() })
  createdAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLogDocument);

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, userId: 1 });
