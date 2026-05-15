import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InventoryItemCategoryDocument } from '@/infrastructure/persistence/schemas/inventory-item-category.schema';
import { InventoryItemCategoryRepository } from '@/domain/inventory/repositories/inventory-item-category.repository';
import { InventoryItemCategory } from '@/domain/inventory/entities/inventory-item-category.entity';
import { InventoryItemCategoryId } from '@/domain/inventory/value-objects/inventory-item-category-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@Injectable()
export class MongoInventoryItemCategoryRepository
  implements InventoryItemCategoryRepository
{
  constructor(
    @InjectModel(InventoryItemCategoryDocument.name)
    private readonly categoryModel: Model<InventoryItemCategoryDocument>,
  ) {}

  async save(category: InventoryItemCategory): Promise<string> {
    const id = category.getId()?.toString();
    const document = {
      tenantId: new Types.ObjectId(category.getTenantId().toString()),
      name: category.getName(),
      description: category.getDescription(),
      updatedAt: category.getUpdatedAt(),
    };

    if (id) {
      await this.categoryModel.findByIdAndUpdate(id, document, { new: true });
      return id;
    }

    const [created] = await this.categoryModel.create([
      { ...document, createdAt: category.getCreatedAt() },
    ]);
    return created._id.toHexString();
  }

  async findById(
    id: InventoryItemCategoryId,
  ): Promise<InventoryItemCategory | null> {
    const doc = await this.categoryModel.findById(id.toString());
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByName(
    tenantId: TenantId,
    name: string,
  ): Promise<InventoryItemCategory | null> {
    const doc = await this.categoryModel.findOne(
      {
        tenantId: new Types.ObjectId(tenantId.toString()),
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      },
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }

  private toDomain(
    doc: InventoryItemCategoryDocument,
  ): InventoryItemCategory {
    return InventoryItemCategory.reconstitute({
      id: InventoryItemCategoryId.create(doc._id.toHexString()),
      tenantId: TenantId.createFromString(doc.tenantId.toHexString()),
      name: doc.name,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
