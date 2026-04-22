import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { WorkflowExecutionStatus } from '../enums/workflow-execution-status.enum';
import { WorkflowType } from '../enums/workflow-type.enum';
import { WorkflowConfigId } from '../value-objects/workflow-config-id.vo';
import { WorkflowExecutionId } from '../value-objects/workflow-execution-id.vo';
import { DomainException } from '@/domain/shared/exceptions/domain.exception';

interface ReconstituteWorkflowExecutionParams {
  id: string;
  tenantId: TenantId;
  workflowType: WorkflowType;
  configId: WorkflowConfigId;
  status: WorkflowExecutionStatus;
  contextSnapshot: Record<string, unknown>;
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkflowExecution {
  private constructor(
    private id: WorkflowExecutionId | null,
    private readonly tenantId: TenantId,
    private readonly workflowType: WorkflowType,
    private readonly configId: WorkflowConfigId,
    private status: WorkflowExecutionStatus,
    private readonly contextSnapshot: Record<string, unknown>,
    private readonly scheduledAt: Date | null,
    private startedAt: Date | null,
    private completedAt: Date | null,
    private errorMessage: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static createImmediate(
    tenantId: TenantId,
    workflowType: WorkflowType,
    configId: WorkflowConfigId,
    contextSnapshot: Record<string, unknown>,
  ): WorkflowExecution {
    const now = new Date();
    return new WorkflowExecution(
      null,
      tenantId,
      workflowType,
      configId,
      WorkflowExecutionStatus.RUNNING,
      contextSnapshot,
      null,
      now,
      null,
      null,
      now,
      now,
    );
  }

  static createDelayed(
    tenantId: TenantId,
    workflowType: WorkflowType,
    configId: WorkflowConfigId,
    contextSnapshot: Record<string, unknown>,
    scheduledAt: Date,
  ): WorkflowExecution {
    const now = new Date();
    return new WorkflowExecution(
      null,
      tenantId,
      workflowType,
      configId,
      WorkflowExecutionStatus.PENDING,
      contextSnapshot,
      scheduledAt,
      null,
      null,
      null,
      now,
      now,
    );
  }

  static reconstitute(data: ReconstituteWorkflowExecutionParams): WorkflowExecution {
    return new WorkflowExecution(
      WorkflowExecutionId.create(data.id),
      data.tenantId,
      data.workflowType,
      data.configId,
      data.status,
      data.contextSnapshot,
      data.scheduledAt,
      data.startedAt,
      data.completedAt,
      data.errorMessage,
      data.createdAt,
      data.updatedAt,
    );
  }

  markRunning(): void {
    if (this.status !== WorkflowExecutionStatus.PENDING) {
      throw new DomainException(
        `Cannot mark execution as RUNNING from status ${this.status}`,
      );
    }
    this.status = WorkflowExecutionStatus.RUNNING;
    this.startedAt = new Date();
    this.touch();
  }

  markSuccess(): void {
    if (this.status !== WorkflowExecutionStatus.RUNNING) {
      throw new DomainException(
        `Cannot mark execution as SUCCESS from status ${this.status}`,
      );
    }
    this.status = WorkflowExecutionStatus.SUCCESS;
    this.completedAt = new Date();
    this.touch();
  }

  markFailed(errorMessage: string): void {
    if (this.status !== WorkflowExecutionStatus.RUNNING) {
      throw new DomainException(
        `Cannot mark execution as FAILED from status ${this.status}`,
      );
    }
    this.status = WorkflowExecutionStatus.FAILED;
    this.errorMessage = errorMessage;
    this.completedAt = new Date();
    this.touch();
  }

  getId(): WorkflowExecutionId | null {
    return this.id;
  }

  setId(id: WorkflowExecutionId): void {
    this.id = id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getWorkflowType(): WorkflowType {
    return this.workflowType;
  }

  getConfigId(): WorkflowConfigId {
    return this.configId;
  }

  getStatus(): WorkflowExecutionStatus {
    return this.status;
  }

  getContextSnapshot(): Record<string, unknown> {
    return this.contextSnapshot;
  }

  getScheduledAt(): Date | null {
    return this.scheduledAt;
  }

  getStartedAt(): Date | null {
    return this.startedAt;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  getErrorMessage(): string | null {
    return this.errorMessage;
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
