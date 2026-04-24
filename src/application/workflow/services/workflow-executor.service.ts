import { Inject, Injectable, Logger } from '@nestjs/common';
import { WorkflowConfig } from '@/domain/workflow/entities/workflow-config.entity';
import { WorkflowExecution } from '@/domain/workflow/entities/workflow-execution.entity';
import {
  WORKFLOW_EXECUTION_REPOSITORY,
  type WorkflowExecutionRepository,
} from '@/domain/workflow/repositories/workflow-execution.repository';
import { WorkflowHandlerRegistry } from './workflow-handler-registry.service';

@Injectable()
export class WorkflowExecutorService {
  private readonly logger = new Logger(WorkflowExecutorService.name);

  constructor(
    private readonly registry: WorkflowHandlerRegistry,
    @Inject(WORKFLOW_EXECUTION_REPOSITORY)
    private readonly executionRepository: WorkflowExecutionRepository,
  ) {}

  async run(
    execution: WorkflowExecution,
    config: WorkflowConfig,
  ): Promise<void> {
    try {
      const handler = this.registry.get(execution.getWorkflowType());
      if (!handler) {
        throw new Error(
          `No handler registered for workflow type: ${execution.getWorkflowType()}`,
        );
      }
      await handler.execute(execution, config);
      execution.markSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Workflow ${execution.getWorkflowType()} failed for tenant ${execution.getTenantId()}: ${message}`,
      );
      execution.markFailed(message);
    }

    await this.executionRepository.save(execution);
  }
}
