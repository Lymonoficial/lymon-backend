import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';

@Schema({ collection: 'workflow_configs', timestamps: true })
export class WorkflowConfigDocument extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({ required: true, enum: WorkflowType })
  workflowType: string;

  @Prop({ required: true, default: false })
  enabled: boolean;

  @Prop({ type: Object, default: {} })
  params: Record<string, unknown>;
}

export const WorkflowConfigSchema =
  SchemaFactory.createForClass(WorkflowConfigDocument);

WorkflowConfigSchema.index(
  { tenantId: 1, workflowType: 1 },
  { unique: true },
);
WorkflowConfigSchema.index({ workflowType: 1, enabled: 1 });
