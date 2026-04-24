import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';
import { WorkflowExecutionStatus } from '@/domain/workflow/enums/workflow-execution-status.enum';

@Schema({ collection: 'workflow_executions', timestamps: true })
export class WorkflowExecutionDocument extends Document {
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

  @Prop({
    type: Types.ObjectId,
    ref: 'WorkflowConfigDocument',
    required: true,
    index: true,
  })
  configId: Types.ObjectId;

  @Prop({ required: true, enum: WorkflowExecutionStatus })
  status: string;

  @Prop({ type: Object, default: {} })
  contextSnapshot: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  scheduledAt: Date | null;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: String, default: null })
  errorMessage: string | null;
}

export const WorkflowExecutionSchema =
  SchemaFactory.createForClass(WorkflowExecutionDocument);

WorkflowExecutionSchema.index({ tenantId: 1, workflowType: 1, createdAt: -1 });
WorkflowExecutionSchema.index({ status: 1, scheduledAt: 1 });
