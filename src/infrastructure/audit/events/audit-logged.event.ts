import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';

export const AUDIT_LOG_EVENT = 'audit.log';

export class AuditLoggedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly userEmail: string,
    public readonly action: AuditAction,
    public readonly entityType: AuditEntityType,
    public readonly entityId?: string,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}
