import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { LogAuditEventHandler } from './commands/log-audit-event.handler';
import { GetAuditLogsHandler } from './queries/get-audit-logs.handler';

const CommandHandlers = [LogAuditEventHandler];
const QueryHandlers = [GetAuditLogsHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class AuditApplicationModule {}
