import { Property } from '@/domain/property/entities/property.entity';
import { PropertyRepository } from '@/domain/property/repositories/property.repository';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { PropertyType } from '@/domain/property/value-objects/property-type.vo';
import { CancellationPolicy } from '@/domain/property/value-objects/cancellation-policy.vo';
import { Location } from '@/domain/property/value-objects/location.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { PropertyDocument } from '../schemas/property.schema';

@Injectable()
export class MongoPropertyRepository implements PropertyRepository {
  constructor(
    @InjectModel(PropertyDocument.name)
    private readonly propertyModel: Model<PropertyDocument>,
  ) {}

  async save(
    property: Property,
    transactionContext?: TransactionContextData,
  ): Promise<string> {
    const id = property.getId()?.toString();
    const session = transactionContext as ClientSession | undefined;

    const document = {
      tenantId: new Types.ObjectId(property.getTenantId().toString()),
      name: property.getName(),
      description: property.getDescription(),
      propertyType: property.getPropertyType().toString(),
      address: property.getAddress(),
      city: property.getCity(),
      state: property.getState(),
      country: property.getCountry(),
      zipCode: property.getZipCode(),
      location: property.getLocation().toObject(),
      checkInTime: property.getCheckInTime(),
      checkOutTime: property.getCheckOutTime(),
      cancellationPolicy: property.getCancellationPolicy().toString(),
      hostPhone: property.getHostPhone(),
      hostEmail: property.getHostEmail(),
      updatedAt: property.getUpdatedAt(),
    };

    if (id) {
      await this.propertyModel.findByIdAndUpdate(id, document, {
        new: true,
        session,
      });
      return id;
    } else {
      const [created] = await this.propertyModel.create(
        [
          {
            ...document,
            createdAt: property.getCreatedAt(),
          },
        ],
        { session },
      );
      return created._id.toString();
    }
  }

  async findById(id: PropertyId): Promise<Property | null> {
    const document = await this.propertyModel.findOne({
      _id: new Types.ObjectId(id.toString()),
      deletedAt: null,
    });
    if (!document) return null;

    return this.toDomain(document);
  }

  async findByTenantId(tenantId: TenantId): Promise<Property[]> {
    const documents = await this.propertyModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        deletedAt: null,
      })
      .sort({ createdAt: -1 });

    return documents.map((doc) => this.toDomain(doc));
  }

  async countByTenantId(tenantId: TenantId): Promise<number> {
    return this.propertyModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId.toString()),
      deletedAt: null,
    });
  }

  async delete(id: PropertyId): Promise<void> {
    await this.propertyModel.findByIdAndUpdate(id.toString(), {
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private toDomain(document: PropertyDocument): Property {
    return Property.reconstitute(
      PropertyId.create(document._id.toString()),
      TenantId.createFromString(document.tenantId.toString()),
      document.name,
      document.description,
      PropertyType.create(document.propertyType),
      document.address,
      document.city,
      document.state,
      document.country,
      document.zipCode,
      Location.create(document.location.lat, document.location.lng),
      document.checkInTime,
      document.checkOutTime,
      CancellationPolicy.create(document.cancellationPolicy),
      document.hostPhone,
      document.hostEmail,
      document.createdAt,
      document.updatedAt,
      document.deletedAt ?? null,
    );
  }
}
