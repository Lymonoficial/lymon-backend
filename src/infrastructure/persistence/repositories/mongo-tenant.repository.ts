import { Tenant } from '@/domain/tenant/entities/tenant.entity';
import { TenantRepository } from '@/domain/tenant/repositories/tenant.repository';
import { Email } from '@/domain/tenant/value-objects/email.vo';
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
      updatedAt: tenant.getUpdatedAt(),
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
    const doc = await this.tenantModel.findById(id.toString());
    return doc ? this.toDomainEntity(doc) : null;
  }
  async findByOwnerEmail(email: Email): Promise<Tenant | null> {
    const doc = await this.tenantModel.findOne({
      ownerEmail: email.toString(),
    });
    return doc ? this.toDomainEntity(doc) : null;
  }
  async exists(email: Email): Promise<boolean> {
    const count = await this.tenantModel.countDocuments({
      ownerEmail: email.toString(),
    });
    return count > 0;
  }

  private toDomainEntity(doc: TenantDocument): Tenant {
    return Tenant.reconstitute(
      TenantId.createFromString(doc._id.toString()),
      doc.name,
      Email.create(doc.ownerEmail),
      PlanType.create(doc.plan),
      doc.emailVerified,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
