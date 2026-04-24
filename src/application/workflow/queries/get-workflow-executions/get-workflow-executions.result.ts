import { WorkflowExecutionDto } from '../shared/workflow-execution.dto';

export class GetWorkflowExecutionsResult {
  constructor(
    public readonly executions: WorkflowExecutionDto[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }
}
