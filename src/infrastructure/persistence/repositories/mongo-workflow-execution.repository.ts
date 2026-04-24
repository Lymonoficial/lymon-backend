import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { WorkflowExecutionRepository } from '@/domain/workflow/repositories/workflow-execution.repository';
import { WorkflowExecution } from '@/domain/workflow/entities/workflow-execution.entity';
import { WorkflowExecutionId } from '@/domain/workflow/value-objects/workflow-execution-id.vo';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';
import { WorkflowExecutionStatus } from '@/domain/workflow/enums/workflow-execution-status.enum';
import { WorkflowExecutionDocument } from '../schemas/workflow-execution.schema';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { WorkflowConfigId } from '@/domain/workflow/value-objects/workflow-config-id.vo';

@Injectable()
export class MongoWorkflowExecutionRepository
  implements WorkflowExecutionRepository
{
  constructor(
    @InjectModel(WorkflowExecutionDocument.name)
    private readonly workflowExecutionModel: Model<WorkflowExecutionDocument>,
  ) {}

  async save(execution: WorkflowExecution): Promise<string> {
    const id = execution.getId()?.toString();

    const document = {
      tenantId: new Types.ObjectId(execution.getTenantId().toString()),
      workflowType: execution.getWorkflowType(),
      configId: new Types.ObjectId(execution.getConfigId().toString()),
      status: execution.getStatus(),
      contextSnapshot: execution.getContextSnapshot(),
      scheduledAt: execution.getScheduledAt(),
      startedAt: execution.getStartedAt(),
      completedAt: execution.getCompletedAt(),
      errorMessage: execution.getErrorMessage(),
      updatedAt: execution.getUpdatedAt(),
    };

    if (id) {
      await this.workflowExecutionModel.findByIdAndUpdate(id, document, {
        new: true,
      });
      return id;
    }

    const newDoc = new this.workflowExecutionModel({
      ...document,
      createdAt: execution.getCreatedAt(),
    });
    const saved = await newDoc.save();
    return saved._id.toHexString();
  }

  async findById(
    id: WorkflowExecutionId,
  ): Promise<WorkflowExecution | null> {
    const doc = await this.workflowExecutionModel.findById(id.toString());
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByTenantId(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<WorkflowExecution[]> {
    const skip = (page - 1) * limit;
    const docs = await this.workflowExecutionModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((d) => this.toDomain(d));
  }

  async findByTenantIdAndType(
    tenantId: string,
    type: WorkflowType,
    page: number,
    limit: number,
  ): Promise<WorkflowExecution[]> {
    const skip = (page - 1) * limit;
    const docs = await this.workflowExecutionModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        workflowType: type,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((d) => this.toDomain(d));
  }

  async findPendingDue(now: Date): Promise<WorkflowExecution[]> {
    const docs = await this.workflowExecutionModel.find({
      status: WorkflowExecutionStatus.PENDING,
      scheduledAt: { $lte: now },
    });
    return docs.map((d) => this.toDomain(d));
  }

  async countByTenantId(tenantId: string): Promise<number> {
    return this.workflowExecutionModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  private toDomain(doc: WorkflowExecutionDocument): WorkflowExecution {
    return WorkflowExecution.reconstitute({
      id: doc._id.toHexString(),
      tenantId: TenantId.createFromString(doc.tenantId.toHexString()),
      workflowType: doc.workflowType as WorkflowType,
      configId: WorkflowConfigId.create(doc.configId.toHexString()),
      status: doc.status as WorkflowExecutionStatus,
      contextSnapshot: doc.contextSnapshot,
      scheduledAt: doc.scheduledAt,
      startedAt: doc.startedAt,
      completedAt: doc.completedAt,
      errorMessage: doc.errorMessage,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
