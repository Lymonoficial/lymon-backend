import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWorkflowConfigsQuery } from './get-workflow-configs.query';
import { GetWorkflowConfigsResult } from './get-workflow-configs.result';
import {
  WORKFLOW_CONFIG_REPOSITORY,
  type WorkflowConfigRepository,
} from '@/domain/workflow/repositories/workflow-config.repository';
import { toWorkflowConfigDto } from '../shared/workflow-config.dto';

@QueryHandler(GetWorkflowConfigsQuery)
export class GetWorkflowConfigsQueryHandler
  implements IQueryHandler<GetWorkflowConfigsQuery, GetWorkflowConfigsResult>
{
  constructor(
    @Inject(WORKFLOW_CONFIG_REPOSITORY)
    private readonly workflowConfigRepository: WorkflowConfigRepository,
  ) {}

  async execute(
    query: GetWorkflowConfigsQuery,
  ): Promise<GetWorkflowConfigsResult> {
    const configs = await this.workflowConfigRepository.findAllByTenant(
      query.tenantId,
    );
    return new GetWorkflowConfigsResult(configs.map(toWorkflowConfigDto));
  }
}
