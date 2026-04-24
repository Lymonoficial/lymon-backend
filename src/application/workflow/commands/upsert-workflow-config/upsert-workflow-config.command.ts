import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';

export class UpsertWorkflowConfigCommand {
  constructor(
    public readonly tenantId: string,
    public readonly workflowType: WorkflowType,
    public readonly enabled: boolean,
    public readonly params: Record<string, unknown>,
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
