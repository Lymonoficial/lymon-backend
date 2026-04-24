import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { UpsertWorkflowConfigHandler } from './commands/upsert-workflow-config/upsert-workflow-config.handler';
import { GetWorkflowConfigsQueryHandler } from './queries/get-workflow-configs/get-workflow-configs.query-handler';
import { GetWorkflowExecutionsQueryHandler } from './queries/get-workflow-executions/get-workflow-executions.query-handler';
import { WorkflowHandlerRegistry } from './services/workflow-handler-registry.service';
import { WorkflowExecutorService } from './services/workflow-executor.service';

const CommandHandlers = [UpsertWorkflowConfigHandler];

const QueryHandlers = [
  GetWorkflowConfigsQueryHandler,
  GetWorkflowExecutionsQueryHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    WorkflowHandlerRegistry,
    WorkflowExecutorService,
  ],
  exports: [
    ...CommandHandlers,
    ...QueryHandlers,
    WorkflowExecutorService,
  ],
})
export class WorkflowApplicationModule {}
