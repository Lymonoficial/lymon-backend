import { Types } from 'mongoose';
import { MongoExperienceRepository } from '@/infrastructure/persistence/repositories/mongo-experience.repository';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

describe('MongoExperienceRepository', () => {
  const PROPERTY_ID = '65f1a1a2b3c4d5e6f7a8b9c1';
  const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9d1';

  let repository: MongoExperienceRepository;
  let experienceModel: {
    find: jest.Mock;
    countDocuments: jest.Mock;
  };

  beforeEach(() => {
    experienceModel = {
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    repository = new MongoExperienceRepository(experienceModel as any);
  });

  it('filters guest availability by the exact property only', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });

    experienceModel.find.mockReturnValue({ sort });
    experienceModel.countDocuments.mockResolvedValue(0);

    await repository.findAvailableForGuestPaginated(
      {
        tenantId: TenantId.createFromString(TENANT_ID),
        propertyId: PropertyId.create(PROPERTY_ID),
      },
      1,
      10,
    );

    const findFilter = experienceModel.find.mock.calls[0][0];
    const countFilter = experienceModel.countDocuments.mock.calls[0][0];

    expect(findFilter).toEqual(countFilter);
    expect(findFilter.tenantId).toBeInstanceOf(Types.ObjectId);
    expect(findFilter.tenantId.toString()).toBe(TENANT_ID);
    expect(findFilter).not.toHaveProperty('$or');
    expect(findFilter.propertyId).toBeInstanceOf(Types.ObjectId);
    expect(findFilter.propertyId.toString()).toBe(PROPERTY_ID);
  });

  it('keeps property filter when no tenant filter is present', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });

    experienceModel.find.mockReturnValue({ sort });
    experienceModel.countDocuments.mockResolvedValue(0);

    await repository.findAvailableForGuestPaginated(
      { propertyId: PropertyId.create(PROPERTY_ID) },
      1,
      10,
    );

    const findFilter = experienceModel.find.mock.calls[0][0];

    expect(findFilter).not.toHaveProperty('tenantId');
    expect(findFilter).not.toHaveProperty('$or');
    expect(findFilter.propertyId).toBeInstanceOf(Types.ObjectId);
    expect(findFilter.propertyId.toString()).toBe(PROPERTY_ID);
  });
});
