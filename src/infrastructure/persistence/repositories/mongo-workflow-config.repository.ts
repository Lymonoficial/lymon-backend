import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { WorkflowConfigRepository } from '@/domain/workflow/repositories/workflow-config.repository';
import { WorkflowConfig } from '@/domain/workflow/entities/workflow-config.entity';
import { WorkflowConfigId } from '@/domain/workflow/value-objects/workflow-config-id.vo';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';
import { WorkflowConfigDocument } from '../schemas/workflow-config.schema';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@Injectable()
export class MongoWorkflowConfigRepository implements WorkflowConfigRepository {
  constructor(
    @InjectModel(WorkflowConfigDocument.name)
    private readonly workflowConfigModel: Model<WorkflowConfigDocument>,
  ) {}

  async save(config: WorkflowConfig): Promise<string> {
    const id = config.getId()?.toString();

    const document = {
      tenantId: new Types.ObjectId(config.getTenantId().toString()),
      workflowType: config.getWorkflowType(),
      enabled: config.isEnabled(),
      params: config.getParams(),
      updatedAt: config.getUpdatedAt(),
    };

    if (id) {
      await this.workflowConfigModel.findByIdAndUpdate(id, document, {
        new: true,
      });
      return id;
    }

    const newDoc = new this.workflowConfigModel({
      ...document,
      createdAt: config.getCreatedAt(),
    });
    const saved = await newDoc.save();
    return saved._id.toHexString();
  }

  async findById(id: WorkflowConfigId): Promise<WorkflowConfig | null> {
    const doc = await this.workflowConfigModel.findById(id.toString());
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByTenantAndType(
    tenantId: string,
    type: WorkflowType,
  ): Promise<WorkflowConfig | null> {
    const doc = await this.workflowConfigModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      workflowType: type,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAllByTenant(tenantId: string): Promise<WorkflowConfig[]> {
    const docs = await this.workflowConfigModel.find({
      tenantId: new Types.ObjectId(tenantId),
    });
    return docs.map((d) => this.toDomain(d));
  }

  async findEnabledByType(type: WorkflowType): Promise<WorkflowConfig[]> {
    const docs = await this.workflowConfigModel.find({
      workflowType: type,
      enabled: true,
    });
    return docs.map((d) => this.toDomain(d));
  }

  private toDomain(doc: WorkflowConfigDocument): WorkflowConfig {
    return WorkflowConfig.reconstitute({
      id: doc._id.toHexString(),
      tenantId: TenantId.createFromString(doc.tenantId.toHexString()),
      workflowType: doc.workflowType as WorkflowType,
      enabled: doc.enabled,
      params: doc.params,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
