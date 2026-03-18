import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { InventoryItemDocument } from '@/infrastructure/persistence/schemas/inventory-item.schema';
import { InventoryItemRepository } from '@/domain/inventory/repositories/inventory-item.repository';
import { InventoryItem } from '@/domain/inventory/entities/inventory-item.entity';
import { InventoryItemId } from '@/domain/inventory/value-objects/inventory-item-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

@Injectable()
export class MongoInventoryItemRepository implements InventoryItemRepository {
  constructor(
    @InjectModel(InventoryItemDocument.name)
    private readonly inventoryItemModel: Model<InventoryItemDocument>,
  ) {}

  async save(
    item: InventoryItem,
    transactionContext?: TransactionContextData,
  ): Promise<string> {
    const id = item.getId()?.toString();
    const session = transactionContext as ClientSession | undefined;

    const document = {
      tenantId: new Types.ObjectId(item.getTenantId().toString()),
      propertyId: new Types.ObjectId(item.getPropertyId().toString()),
      sku: item.getSku(),
      name: item.getName(),
      category: item.getCategory(),
      unit: item.getUnit(),
      minStock: item.getMinStock(),
      currentStock: item.getCurrentStock(),
      updatedAt: item.getUpdatedAt(),
    };

    if (id) {
      await this.inventoryItemModel.findByIdAndUpdate(id, document, {
        new: true,
        session,
      });
      return id;
    }

    const [created] = await this.inventoryItemModel.create(
      [
        {
          ...document,
          createdAt: item.getCreatedAt(),
        },
      ],
      { session },
    );

    return created._id.toString();
  }

  async findById(id: InventoryItemId): Promise<InventoryItem | null> {
    const document = await this.inventoryItemModel.findOne({
      _id: id.toString(),
      deletedAt: null,
    });
    if (!document) return null;
    return this.toDomain(document);
  }

  async findByPropertyId(
    tenantId: TenantId,
    propertyId: PropertyId,
  ): Promise<InventoryItem[]> {
    const documents = await this.inventoryItemModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        propertyId: new Types.ObjectId(propertyId.toString()),
        deletedAt: null,
      })
      .sort({ createdAt: -1 });

    return documents.map((document) => this.toDomain(document));
  }

  async findLowStockByPropertyId(
    tenantId: TenantId,
    propertyId: PropertyId,
  ): Promise<InventoryItem[]> {
    const documents = await this.inventoryItemModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        propertyId: new Types.ObjectId(propertyId.toString()),
        deletedAt: null,
        $expr: { $lte: ['$currentStock', '$minStock'] },
      })
      .sort({ currentStock: 1, updatedAt: -1 });

    return documents.map((document) => this.toDomain(document));
  }

  async findByPropertyIdAndSku(
    tenantId: TenantId,
    propertyId: PropertyId,
    sku: string,
  ): Promise<InventoryItem | null> {
    const document = await this.inventoryItemModel.findOne({
      tenantId: new Types.ObjectId(tenantId.toString()),
      propertyId: new Types.ObjectId(propertyId.toString()),
      sku: sku.trim(),
      deletedAt: null,
    });

    if (!document) return null;
    return this.toDomain(document);
  }

  async delete(id: InventoryItemId): Promise<void> {
    await this.inventoryItemModel.findByIdAndUpdate(id.toString(), {
      deletedAt: new Date(),
    });
  }

  private toDomain(document: InventoryItemDocument): InventoryItem {
    return InventoryItem.reconstitute(
      InventoryItemId.create(document._id.toString()),
      TenantId.createFromString(document.tenantId.toString()),
      PropertyId.create(document.propertyId.toString()),
      document.sku,
      document.name,
      document.category,
      document.unit,
      document.minStock,
      document.currentStock,
      document.createdAt,
      document.updatedAt,
    );
  }
}
