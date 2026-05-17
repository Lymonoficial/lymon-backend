import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  GuestTag,
  PLATFORM_TENANT_ID,
} from '@/domain/guest-tag/entities/guest-tag.entity';
import type { GuestTagRepository } from '@/domain/guest-tag/repositories/guest-tag.repository';
import { GuestTagId } from '@/domain/guest-tag/value-objects/guest-tag-id.vo';
import { GuestTagDocument } from '@/infrastructure/persistence/schemas/guest-tag.schema';

@Injectable()
export class MongoGuestTagRepository implements GuestTagRepository {
  constructor(
    @InjectModel(GuestTagDocument.name)
    private readonly tagModel: Model<GuestTagDocument>,
  ) {}

  async save(tag: GuestTag): Promise<void> {
    await this.tagModel.create({
      tenantId: tag.getTenantId(),
      name: tag.getName(),
      createdAt: tag.getCreatedAt(),
    });
  }

  async findAll(tenantId: string): Promise<GuestTag[]> {
    const docs = await this.tagModel.find({
      tenantId: { $in: [tenantId, PLATFORM_TENANT_ID] },
    });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByNames(names: string[], tenantId: string): Promise<GuestTag[]> {
    const lowercasedNames = names.map((n) => n.trim().toLowerCase());
    const docs = await this.tagModel.find({
      tenantId: { $in: [tenantId, PLATFORM_TENANT_ID] },
      name: { $in: lowercasedNames },
    });
    return docs.map((doc) => this.toDomain(doc));
  }

  async existsByTenantIdAndName(
    tenantId: string,
    name: string,
  ): Promise<boolean> {
    const doc = await this.tagModel.findOne({ tenantId, name });
    return doc !== null;
  }

  private toDomain(doc: GuestTagDocument): GuestTag {
    return GuestTag.reconstitute(
      GuestTagId.createFromString(doc._id.toString()),
      doc.tenantId,
      doc.name,
      doc.createdAt,
    );
  }
}
