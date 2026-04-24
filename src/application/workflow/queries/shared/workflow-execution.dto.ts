import { WorkflowExecution } from '@/domain/workflow/entities/workflow-execution.entity';
import { WorkflowExecutionStatus } from '@/domain/workflow/enums/workflow-execution-status.enum';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';

export class WorkflowExecutionDto {
  constructor(
    public readonly id: string,
    public readonly workflowType: WorkflowType,
    public readonly configId: string,
    public readonly status: WorkflowExecutionStatus,
    public readonly contextSnapshot: Record<string, unknown>,
    public readonly scheduledAt: Date | null,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly errorMessage: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export const toWorkflowExecutionDto = (
  execution: WorkflowExecution,
): WorkflowExecutionDto =>
  new WorkflowExecutionDto(
    execution.getId()?.toString() ?? '',
    execution.getWorkflowType(),
    execution.getConfigId().toString(),
    execution.getStatus(),
    execution.getContextSnapshot(),
    execution.getScheduledAt(),
    execution.getStartedAt(),
    execution.getCompletedAt(),
    execution.getErrorMessage(),
    execution.getCreatedAt(),
    execution.getUpdatedAt(),
  );
