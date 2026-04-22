import { WorkflowExecution } from '../entities/workflow-execution.entity';
import { WorkflowType } from '../enums/workflow-type.enum';
import { WorkflowExecutionId } from '../value-objects/workflow-execution-id.vo';

export const WORKFLOW_EXECUTION_REPOSITORY = 'WORKFLOW_EXECUTION_REPOSITORY';

export interface WorkflowExecutionRepository {
  save(execution: WorkflowExecution): Promise<string>;
  findById(id: WorkflowExecutionId): Promise<WorkflowExecution | null>;
  findByTenantId(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<WorkflowExecution[]>;
  findByTenantIdAndType(
    tenantId: string,
    type: WorkflowType,
    page: number,
    limit: number,
  ): Promise<WorkflowExecution[]>;
  findPendingDue(now: Date): Promise<WorkflowExecution[]>;
  countByTenantId(tenantId: string): Promise<number>;
}
