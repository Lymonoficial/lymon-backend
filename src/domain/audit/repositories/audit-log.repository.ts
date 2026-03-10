import type { AuditLog } from '@/domain/audit/entities/audit-log.entity';
import type {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLogRepository {
  save(log: AuditLog): Promise<void>;
  findByTenant(
    tenantId: string,
    filters: AuditLogFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<AuditLog>>;
}

export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');
