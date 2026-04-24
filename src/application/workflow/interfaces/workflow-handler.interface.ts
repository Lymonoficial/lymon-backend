import { WorkflowConfig } from '@/domain/workflow/entities/workflow-config.entity';
import { WorkflowExecution } from '@/domain/workflow/entities/workflow-execution.entity';

export interface IWorkflowHandler {
  execute(execution: WorkflowExecution, config: WorkflowConfig): Promise<void>;
}
