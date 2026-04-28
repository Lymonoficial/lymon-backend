import {
  Tenant,
  TenantReconstitutionProps,
} from '@/domain/tenant/entities/tenant.entity';
import { TenantRepository } from '@/domain/tenant/repositories/tenant.repository';
import { Email } from '@/domain/shared/value-objects/email.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TenantDocument } from '../schemas/tenant.schema';
import { Model } from 'mongoose';
import { PlanType } from '@/domain/tenant/value-objects/plan-type.vo';

@Injectable()
export class MongoTenantRepository implements TenantRepository {
  constructor(
    @InjectModel(TenantDocument.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async save(tenant: Tenant): Promise<void> {
    const id = tenant.getId()?.toString();

    const document = {
      name: tenant.getName(),
      ownerEmail: tenant.getOwnerEmail().toString(),
      plan: tenant.getPlan().toString(),
      emailVerified: tenant.isEmailVerified(),
      contactPhone: tenant.getContactPhone(),
      address: tenant.getAddress(),
      website: tenant.getWebsite(),
      logoUrl: tenant.getLogoUrl(),
      updatedAt: tenant.getUpdatedAt(),
      deletedAt: tenant.getDeletedAt(),
    };

    if (id) {
      await this.tenantModel.findByIdAndUpdate(id, document, {
        new: true,
      });
    } else {
      await this.tenantModel.create({
        ...document,
        createdAt: tenant.getCreatedAt(),
      });
    }
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    const doc = await this.tenantModel.findOne({
      _id: id.toString(),
      deletedAt: null,
    });
    return doc ? this.toDomainEntity(doc) : null;
  }
  async findByOwnerEmail(email: Email): Promise<Tenant | null> {
    const doc = await this.tenantModel.findOne({
      ownerEmail: email.toString(),
      deletedAt: null,
    });
    return doc ? this.toDomainEntity(doc) : null;
  }
  async exists(email: Email): Promise<boolean> {
    const count = await this.tenantModel.countDocuments({
      ownerEmail: email.toString(),
      deletedAt: null,
    });
    return count > 0;
  }

  private toDomainEntity(doc: TenantDocument): Tenant {
    const props: TenantReconstitutionProps = {
      id: TenantId.createFromString(doc._id.toString()),
      name: doc.name,
      ownerEmail: Email.create(doc.ownerEmail),
      plan: PlanType.create(doc.plan),
      emailVerified: doc.emailVerified,
      contactPhone: doc.contactPhone ?? null,
      address: doc.address ?? null,
      website: doc.website ?? null,
      logoUrl: doc.logoUrl ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
    return Tenant.reconstitute(props);
  }
}
