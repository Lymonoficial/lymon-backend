import {
  Tenant,
  TenantReconstitutionProps,
} from '@/domain/tenant/entities/tenant.entity';
import { TenantRepository } from '@/domain/tenant/repositories/tenant.repository';
import { Email } from '@/domain/shared/value-objects/email.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import {
  createSlug,
  generateUniqueSlug,
} from '@/domain/shared/utils/slug.util';
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
      description: tenant.getDescription(),
      logoKey: tenant.getLogoKey(),
      theme: tenant.getTheme(),
      updatedAt: tenant.getUpdatedAt(),
      deletedAt: tenant.getDeletedAt(),
      trialEndsAt: tenant.getTrialEndsAt(),
    };

    if (id) {
      const existing = await this.tenantModel
        .findById(id)
        .select('name slug')
        .lean();
      const slug =
        existing && existing.name !== tenant.getName()
          ? await this.generateSlugForId(tenant.getName(), id)
          : existing?.slug;

      await this.tenantModel.findByIdAndUpdate(
        id,
        { ...document, slug },
        { new: true },
      );
    } else {
      const created = await this.tenantModel.create({
        ...document,
        createdAt: tenant.getCreatedAt(),
      });
      const newId = created._id.toString();
      const slug = await this.generateSlugForId(tenant.getName(), newId);
      await this.tenantModel.updateOne({ _id: newId }, { slug });
    }
  }

  private async generateSlugForId(name: string, id: string): Promise<string> {
    return generateUniqueSlug(name, id, async (candidate) => {
      const taken = await this.tenantModel.exists({
        slug: candidate,
        _id: { $ne: id },
      });
      return taken !== null;
    });
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

  async findBySlug(slug: string): Promise<Tenant | null> {
    const docs = await this.tenantModel.find({
      deletedAt: null,
    });

    const doc = docs.find(
      (item) => item.slug === slug || createSlug(item.name) === slug,
    );

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
      slug: doc.slug,
      ownerEmail: Email.create(doc.ownerEmail),
      plan: PlanType.create(doc.plan),
      emailVerified: doc.emailVerified,
      contactPhone: doc.contactPhone ?? null,
      address: doc.address ?? null,
      description: doc.description ?? null,
      logoKey: doc.logoKey ?? null,
      theme: doc.theme ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
      trialEndsAt: doc.trialEndsAt ?? null,
    };
    return Tenant.reconstitute(props);
  }
}
