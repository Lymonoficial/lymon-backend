import { WorkflowConfig } from '@/domain/workflow/entities/workflow-config.entity';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';

export class WorkflowConfigDto {
  constructor(
    public readonly id: string,
    public readonly workflowType: WorkflowType,
    public readonly enabled: boolean,
    public readonly params: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export const toWorkflowConfigDto = (config: WorkflowConfig): WorkflowConfigDto =>
  new WorkflowConfigDto(
    config.getId()?.toString() ?? '',
    config.getWorkflowType(),
    config.isEnabled(),
    config.getParams(),
    config.getCreatedAt(),
    config.getUpdatedAt(),
  );
