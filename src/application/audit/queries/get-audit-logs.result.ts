export interface AuditLogDto {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface GetAuditLogsResult {
  items: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
}
