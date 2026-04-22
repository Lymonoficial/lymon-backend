import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { WorkflowType } from '../enums/workflow-type.enum';
import { WorkflowConfigId } from '../value-objects/workflow-config-id.vo';

interface CreateWorkflowConfigParams {
  tenantId: TenantId;
  workflowType: WorkflowType;
  params?: Record<string, unknown>;
}

interface ReconstituteWorkflowConfigParams {
  id: string;
  tenantId: TenantId;
  workflowType: WorkflowType;
  enabled: boolean;
  params: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkflowConfig {
  private constructor(
    private id: WorkflowConfigId | null,
    private readonly tenantId: TenantId,
    private readonly workflowType: WorkflowType,
    private enabled: boolean,
    private params: Record<string, unknown>,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(params: CreateWorkflowConfigParams): WorkflowConfig {
    return new WorkflowConfig(
      null,
      params.tenantId,
      params.workflowType,
      false,
      params.params ?? {},
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: ReconstituteWorkflowConfigParams): WorkflowConfig {
    return new WorkflowConfig(
      WorkflowConfigId.create(data.id),
      data.tenantId,
      data.workflowType,
      data.enabled,
      data.params,
      data.createdAt,
      data.updatedAt,
    );
  }

  enable(): void {
    this.enabled = true;
    this.touch();
  }

  disable(): void {
    this.enabled = false;
    this.touch();
  }

  updateParams(params: Record<string, unknown>): void {
    this.params = params;
    this.touch();
  }

  getId(): WorkflowConfigId | null {
    return this.id;
  }

  setId(id: WorkflowConfigId): void {
    this.id = id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getWorkflowType(): WorkflowType {
    return this.workflowType;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getParams(): Record<string, unknown> {
    return this.params;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
