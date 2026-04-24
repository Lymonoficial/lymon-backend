import { Module } from '@nestjs/common';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { WorkflowApplicationModule } from '@/application/workflow/workflow-application.module';
import { WorkflowEventListener } from './listeners/workflow-event.listener';

@Module({
  imports: [PersistenceModule, WorkflowApplicationModule],
  providers: [WorkflowEventListener],
})
export class WorkflowInfrastructureModule {}
