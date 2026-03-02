import type { AuditLogFilters } from '@/domain/audit/repositories/audit-log.repository';

export class GetAuditLogsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly filters: AuditLogFilters,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
