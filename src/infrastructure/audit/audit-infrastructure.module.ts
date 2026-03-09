import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuditEventListener } from './listeners/audit-event.listener';

@Module({
  imports: [CqrsModule],
  providers: [AuditEventListener],
})
export class AuditInfrastructureModule {}
