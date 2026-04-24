import { WorkflowConfigDto } from '../shared/workflow-config.dto';

export class GetWorkflowConfigsResult {
  constructor(public readonly configs: WorkflowConfigDto[]) {}
}
