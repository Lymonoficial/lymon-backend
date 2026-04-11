import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { LogAuditEventCommand } from './log-audit-event.command';
import {
  AUDIT_LOG_REPOSITORY,
  type AuditLogRepository,
} from '@/domain/audit/repositories/audit-log.repository';
import { AuditLog } from '@/domain/audit/entities/audit-log.entity';
import { getRequestAuditContext } from '@/infrastructure/audit/request-audit-context';

@CommandHandler(LogAuditEventCommand)
export class LogAuditEventHandler implements ICommandHandler<LogAuditEventCommand> {
  private readonly logger = new Logger(LogAuditEventHandler.name);

  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async execute(command: LogAuditEventCommand): Promise<void> {
    try {
      const requestAuditContext = getRequestAuditContext();
      const log = AuditLog.create(
        command.tenantId,
        command.userId,
        command.userEmail,
        command.action,
        command.entityType,
        command.entityId,
        command.metadata,
        command.previousValue,
        command.newValue,
        command.ipAddress ?? requestAuditContext?.ipAddress,
      );
      await this.auditLogRepository.save(log);
    } catch (error) {
      // Never rethrow — audit failure must not break the main flow
      this.logger.error('Failed to persist audit log', error);
    }
  }
}
