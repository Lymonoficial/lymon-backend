import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from '@/application/auth/commands/logout.command';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';

export class LogoutResult {
  constructor(public readonly message: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async execute(command: LogoutCommand): Promise<LogoutResult> {
    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.userId,
        command.email,
        AuditAction.AUTH_LOGOUT,
        AuditEntityType.AUTH,
        command.userId,
      ),
    );

    return new LogoutResult('Logout successful');
  }
}
