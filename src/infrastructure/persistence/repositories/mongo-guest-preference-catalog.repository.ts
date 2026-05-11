import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  GuestPreferenceCatalogItem,
  GuestPreferenceCatalogItemReconstitutionData,
  GuestPreferenceSourceEnum,
} from '@/domain/guest-preference/entities/guest-preference-catalog-item.entity';
import { GuestPreferenceCatalogRepository } from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import { GuestPreferenceCatalogItemDocument } from '@/infrastructure/persistence/schemas/guest-preference-catalog-item.schema';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestPreferenceCategoryEnum } from '@/domain/guest-preference/value-objects/guest-preference-category.vo';
import { GuestPreferencePredefinedKeyEnum } from '@/domain/guest-preference/value-objects/guest-preference-predefined-key.vo';

@Injectable()
export class MongoGuestPreferenceCatalogRepository implements GuestPreferenceCatalogRepository {
  constructor(
    @InjectModel(GuestPreferenceCatalogItemDocument.name)
    private readonly model: Model<GuestPreferenceCatalogItemDocument>,
  ) {}

  async save(item: GuestPreferenceCatalogItem): Promise<string> {
    const id = item.getId();

    const document = {
      tenantId: new Types.ObjectId(item.getTenantId().toString()),
      category: item.getCategory(),
      source: item.getSource(),
      key: item.getKey(),
      label: item.getLabel(),
      isActive: item.getIsActive(),
      updatedAt: item.getUpdatedAt(),
    };

    if (id) {
      await this.model.findByIdAndUpdate(id, document, { new: true });
      return id;
    }

    const created = await this.model.create({
      ...document,
      createdAt: item.getCreatedAt(),
    });

    return created._id.toString();
  }

  async findByTenant(
    tenantId: TenantId,
  ): Promise<GuestPreferenceCatalogItem[]> {
    const docs = await this.model
      .find({ tenantId: new Types.ObjectId(tenantId.toString()) })
      .sort({ createdAt: 1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<GuestPreferenceCatalogItem | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  private toDomain(
    doc: GuestPreferenceCatalogItemDocument,
  ): GuestPreferenceCatalogItem {
    const data: GuestPreferenceCatalogItemReconstitutionData = {
      id: doc._id.toString(),
      tenantId: TenantId.createFromString(doc.tenantId.toString()),
      category: doc.category as GuestPreferenceCategoryEnum,
      source: doc.source as GuestPreferenceSourceEnum,
      key: doc.key ? (doc.key as GuestPreferencePredefinedKeyEnum) : null,
      label: doc.label ?? null,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return GuestPreferenceCatalogItem.reconstitute(data);
  }
}
