import { Unit } from '@/domain/unit/entities/unit.entity';
import { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ExternalIds } from '@/domain/unit/value-objects/external-ids.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { UnitDocument } from '../schemas/unit.schema';

@Injectable()
export class MongoUnitRepository implements UnitRepository {
  constructor(
    @InjectModel(UnitDocument.name)
    private readonly unitModel: Model<UnitDocument>,
  ) {}

  async save(
    unit: Unit,
    transactionContext?: TransactionContextData,
  ): Promise<string> {
    const id = unit.getId()?.toString();
    const session = transactionContext as ClientSession | undefined;

    const document = {
      tenantId: new Types.ObjectId(unit.getTenantId().toString()),
      propertyId: new Types.ObjectId(unit.getPropertyId().toString()),
      name: unit.getName(),
      description: unit.getDescription(),
      inventoryCount: unit.getInventoryCount(),
      maxGuests: unit.getMaxGuests(),
      standardGuests: unit.getStandardGuests(),
      bedrooms: unit.getBedrooms(),
      bathroomsCount: unit.getBathroomsCount(),
      isShared: unit.getIsShared(),
      amenities: unit.getAmenities(),
      pricePerNight: unit.getPricePerNight(),
      externalIds: unit.getExternalIds().toObject(),
      updatedAt: unit.getUpdatedAt(),
    };

    if (id) {
      await this.unitModel.findByIdAndUpdate(id, document, {
        new: true,
        session,
      });
      return id;
    } else {
      const [created] = await this.unitModel.create(
        [
          {
            ...document,
            createdAt: unit.getCreatedAt(),
          },
        ],
        { session },
      );
      return created._id.toString();
    }
  }

  async findById(id: UnitId): Promise<Unit | null> {
    const document = await this.unitModel.findOne({
      _id: id.toString(),
      deletedAt: null,
    });
    if (!document) return null;

    return this.toDomain(document);
  }

  async findByPropertyId(propertyId: PropertyId): Promise<Unit[]> {
    const documents = await this.unitModel
      .find({
        propertyId: new Types.ObjectId(propertyId.toString()),
        deletedAt: null,
      })
      .sort({ createdAt: -1 });

    return documents.map((doc) => this.toDomain(doc));
  }

  async findByTenantId(tenantId: TenantId): Promise<Unit[]> {
    const documents = await this.unitModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        deletedAt: null,
      })
      .sort({ createdAt: -1 });

    return documents.map((doc) => this.toDomain(doc));
  }

  async findByTenantIdPaginated(
    tenantId: TenantId,
    page: number,
    limit: number,
  ): Promise<{ units: Unit[]; total: number }> {
    const filter = {
      tenantId: new Types.ObjectId(tenantId.toString()),
      deletedAt: null,
    };
    const total = await this.unitModel.countDocuments(filter);
    const documents = await this.unitModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return {
      units: documents.map((doc) => this.toDomain(doc)),
      total,
    };
  }

  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ units: Unit[]; total: number }> {
    const filter = { deletedAt: null };
    const total = await this.unitModel.countDocuments(filter);
    const documents = await this.unitModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return {
      units: documents.map((doc) => this.toDomain(doc)),
      total,
    };
  }

  async countByTenantId(tenantId: TenantId): Promise<number> {
    return this.unitModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId.toString()),
      deletedAt: null,
    });
  }

  async delete(id: UnitId): Promise<void> {
    await this.unitModel.findByIdAndUpdate(id.toString(), {
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private toDomain(document: UnitDocument): Unit {
    return Unit.reconstitute({
      id: UnitId.create(document._id.toString()),
      tenantId: TenantId.createFromString(document.tenantId.toString()),
      propertyId: PropertyId.create(document.propertyId.toString()),
      basicInfo: {
        name: document.name,
        description: document.description,
      },
      inventoryConfig: {
        inventoryCount: document.inventoryCount,
      },
      capacityConfig: {
        maxGuests: document.maxGuests,
        standardGuests: document.standardGuests,
      },
      physicalFeatures: {
        bedrooms: document.bedrooms,
        bathroomsCount: document.bathroomsCount,
        isShared: document.isShared,
      },
      pricingConfig: {
        pricePerNight: document.pricePerNight,
      },
      amenities: document.amenities,
      externalIds: ExternalIds.create(
        document.externalIds?.airbnbId,
        document.externalIds?.bookingId,
        document.externalIds?.vrboId,
      ),
      timestamps: {
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
    });
  }
}
