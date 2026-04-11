import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { SupplierRepository } from '@/domain/inventory/repositories/supplier.repository';
import { SupplierDocument } from '@/infrastructure/persistence/schemas/supplier.schema';
import { Supplier } from '@/domain/inventory/entities/supplier.entity';
import { SupplierId } from '@/domain/inventory/value-objects/supplier-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

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

  async findByNit(tenantId: TenantId, nit: string): Promise<Supplier | null> {
    const document = await this.supplierModel.findOne({
      tenantId: new Types.ObjectId(tenantId.toString()),
      nit: nit.trim().toUpperCase(),
      deletedAt: null,
    });

    if (!document) return null;
    return this.toDomain(document);
  }

  private toDomain(document: SupplierDocument): Supplier {
    return Supplier.reconstitute(
      SupplierId.create(document._id.toHexString()),
      TenantId.createFromString(document.tenantId.toHexString()),
      document.name,
      document.contactEmail,
      document.contactPhone,
      document.country,
      document.city,
      document.nit,
      document.createdAt,
      document.updatedAt,
      document.deletedAt,
    );
  }
}
