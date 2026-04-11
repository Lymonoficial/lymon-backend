import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { SupplierRepository } from '@/domain/inventory/repositories/supplier.repository';
import { SupplierDocument } from '@/infrastructure/persistence/schemas/supplier.schema';
import { Supplier } from '@/domain/inventory/entities/supplier.entity';
import { SupplierId } from '@/domain/inventory/value-objects/supplier-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

type SupplierSortBy = 'name' | 'createdAt';
type SupplierSortOrder = 'asc' | 'desc';
type SupplierFindByTenantIdOptions = {
  sortBy?: SupplierSortBy;
  sortOrder?: SupplierSortOrder;
};

@Injectable()
export class MongoSupplierRepository implements SupplierRepository {
  constructor(
    @InjectModel(SupplierDocument.name)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  async save(
    supplier: Supplier,
    transactionContext?: TransactionContextData,
  ): Promise<string> {
    const id = supplier.getId()?.toString();
    const session = transactionContext as ClientSession | undefined;

    const document = {
      tenantId: new Types.ObjectId(supplier.getTenantId().toString()),
      name: supplier.getName(),
      contactEmail: supplier.getContactEmail(),
      contactPhone: supplier.getContactPhone(),
      country: supplier.getCountry(),
      city: supplier.getCity(),
      nit: supplier.getNit(),
      updatedAt: supplier.getUpdatedAt(),
    };

    if (id) {
      await this.supplierModel.findByIdAndUpdate(id, document, {
        new: true,
        session,
      });
      return id;
    }

    const [created] = await this.supplierModel.create(
      [
        {
          ...document,
          createdAt: supplier.getCreatedAt(),
        },
      ],
      { session },
    );

    return created._id.toHexString();
  }

  async findById(id: SupplierId): Promise<Supplier | null> {
    const document = await this.supplierModel.findOne({
      _id: id.toString(),
      deletedAt: null,
    });
    if (!document) return null;
    return this.toDomain(document);
  }

  async findByTenantId(
    tenantId: TenantId,
    options?: SupplierFindByTenantIdOptions,
  ): Promise<Supplier[]> {
    const sortBy = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'desc';
    const documents = await this.supplierModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        deletedAt: null,
      })
      .sort(this.buildSort(sortBy, sortOrder));

    return documents.map((document) => this.toDomain(document));
  }

  async findByNit(tenantId: TenantId, nit: string): Promise<Supplier | null> {
    const document = await this.supplierModel.findOne({
      tenantId: new Types.ObjectId(tenantId.toString()),
      nit: nit.trim().toUpperCase(),
      deletedAt: null,
    });

    if (!document) return null;
    return this.toDomain(document);
  }

  async delete(id: SupplierId): Promise<void> {
    await this.supplierModel.findByIdAndUpdate(id.toString(), {
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private toDomain(document: SupplierDocument): Supplier {
    return Supplier.reconstitute({
      id: SupplierId.create(document._id.toHexString()),
      tenantId: TenantId.createFromString(document.tenantId.toHexString()),
      name: document.name,
      contactEmail: document.contactEmail,
      contactPhone: document.contactPhone,
      country: document.country,
      city: document.city,
      nit: document.nit,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deletedAt: document.deletedAt,
    });
  }

  private buildSort(
    sortBy: SupplierSortBy,
    sortOrder: SupplierSortOrder,
  ): Record<string, 1 | -1> {
    return {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };
  }
}
