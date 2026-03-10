import {
  type AuditLogFilters,
  type AuditLogRepository,
  type Pagination,
  type PaginatedResult,
} from '@/domain/audit/repositories/audit-log.repository';
import { AuditLog, AuditLogId } from '@/domain/audit/entities/audit-log.entity';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import { AuditLogDocument } from '@/infrastructure/persistence/schemas/audit-log.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class MongoAuditLogRepository implements AuditLogRepository {
  constructor(
    @InjectModel(AuditLogDocument.name)
    private readonly model: Model<AuditLogDocument>,
  ) {}

  async save(log: AuditLog): Promise<void> {
    await this.model.create({
      tenantId: log.getTenantId(),
      userId: log.getUserId(),
      userEmail: log.getUserEmail(),
      action: log.getAction(),
      entityType: log.getEntityType(),
      entityId: log.getEntityId(),
      metadata: log.getMetadata(),
      createdAt: log.getCreatedAt(),
    });
  }

  async findByTenant(
    tenantId: string,
    filters: AuditLogFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<AuditLog>> {
    const query: Record<string, unknown> = { tenantId };

    if (filters.userId) query.userId = filters.userId;
    if (filters.action) query.action = filters.action;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.dateFrom || filters.dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (filters.dateFrom) dateFilter['$gte'] = filters.dateFrom;
      if (filters.dateTo) dateFilter['$lte'] = filters.dateTo;
      query.createdAt = dateFilter;
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [total, docs] = await Promise.all([
      this.model.countDocuments(query),
      this.model
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
    ]);

    return {
      items: docs.map((doc) => this.toDomain(doc)),
      total,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  private toDomain(doc: {
    _id: { toString(): string };
    tenantId: string;
    userId: string;
    userEmail: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
  }): AuditLog {
    return AuditLog.reconstitute(
      AuditLogId.createFromString(doc._id.toString()),
      doc.tenantId,
      doc.userId,
      doc.userEmail,
      doc.action as AuditAction,
      doc.entityType as AuditEntityType,
      doc.entityId,
      doc.metadata,
      doc.createdAt,
    );
  }
}
