import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWorkflowExecutionsQuery } from './get-workflow-executions.query';
import { GetWorkflowExecutionsResult } from './get-workflow-executions.result';
import {
  WORKFLOW_EXECUTION_REPOSITORY,
  type WorkflowExecutionRepository,
} from '@/domain/workflow/repositories/workflow-execution.repository';
import { toWorkflowExecutionDto } from '../shared/workflow-execution.dto';

@QueryHandler(GetWorkflowExecutionsQuery)
export class GetWorkflowExecutionsQueryHandler
  implements
    IQueryHandler<GetWorkflowExecutionsQuery, GetWorkflowExecutionsResult>
{
  constructor(
    @Inject(WORKFLOW_EXECUTION_REPOSITORY)
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
  ) {}

  async execute(
    query: GetWorkflowExecutionsQuery,
  ): Promise<GetWorkflowExecutionsResult> {
    const [executions, total] = await Promise.all([
      query.workflowType
        ? this.workflowExecutionRepository.findByTenantIdAndType(
            query.tenantId,
            query.workflowType,
            query.page,
            query.limit,
          )
        : this.workflowExecutionRepository.findByTenantId(
            query.tenantId,
            query.page,
            query.limit,
          ),
      this.workflowExecutionRepository.countByTenantId(query.tenantId),
    ]);

    return new GetWorkflowExecutionsResult(
      executions.map(toWorkflowExecutionDto),
      total,
      query.page,
      query.limit,
    );
  }
}
