import { MongoTenantRepository } from '@/infrastructure/persistence/repositories/mongo-tenant.repository';
import { Tenant } from '@/domain/tenant/entities/tenant.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { Email } from '@/domain/shared/value-objects/email.vo';
import { PlanType } from '@/domain/tenant/value-objects/plan-type.vo';

describe('MongoTenantRepository', () => {
  const makeTenant = () =>
    Tenant.reconstitute({
      id: TenantId.createFromString('65f1a1a2b3c4d5e6f7a8b9c2'),
      name: 'Tenant Name',
      ownerEmail: Email.create('owner@test.com'),
      plan: PlanType.create('TRIAL'),
      emailVerified: true,
      contactPhone: '12345',
      address: 'Address',
      website: 'https://site.test',
      logoUrl: 'https://site.test/logo.png',
      createdAt: new Date('2030-01-01T00:00:00Z'),
      updatedAt: new Date('2030-01-02T00:00:00Z'),
    });

  it('saves existing tenant via findByIdAndUpdate', async () => {
    const tenantModel: any = {
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      create: jest.fn(),
    };
    const repo = new MongoTenantRepository(tenantModel);

    await repo.save(makeTenant());

    expect(tenantModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('creates tenant when id is null', async () => {
    const tenantModel: any = {
      findByIdAndUpdate: jest.fn(),
      create: jest.fn().mockResolvedValue([{}]),
    };
    const repo = new MongoTenantRepository(tenantModel);

    const newTenant = Tenant.create(
      'New Tenant',
      Email.create('new@test.com'),
      PlanType.create('TRIAL'),
    );

    await repo.save(newTenant);

    expect(tenantModel.create).toHaveBeenCalledTimes(1);
  });

  it('finds tenant by id', async () => {
    const doc = {
      _id: '65f1a1a2b3c4d5e6f7a8b9c2',
      name: 'Tenant Name',
      ownerEmail: 'owner@test.com',
      plan: 'TRIAL',
      emailVerified: true,
      contactPhone: '12345',
      address: 'Address',
      website: 'https://site.test',
      logoUrl: 'https://site.test/logo.png',
      createdAt: new Date('2030-01-01T00:00:00Z'),
      updatedAt: new Date('2030-01-02T00:00:00Z'),
    };

    const tenantModel: any = {
      findById: jest.fn().mockResolvedValue(doc),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
    };
    const repo = new MongoTenantRepository(tenantModel);

    const tenant = await repo.findById(TenantId.createFromString(doc._id));

    expect(tenant).not.toBeNull();
    expect(tenant?.getName()).toBe('Tenant Name');
  });

  it('checks existence by owner email', async () => {
    const tenantModel: any = {
      findById: jest.fn(),
      findOne: jest.fn().mockResolvedValue(null),
      countDocuments: jest.fn().mockResolvedValue(1),
    };
    const repo = new MongoTenantRepository(tenantModel);

    const exists = await repo.exists(Email.create('owner@test.com'));

    expect(exists).toBe(true);
  });
});
