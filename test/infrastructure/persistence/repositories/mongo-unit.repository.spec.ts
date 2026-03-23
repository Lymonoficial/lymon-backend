import { Types } from 'mongoose';
import { MongoUnitRepository } from '@/infrastructure/persistence/repositories/mongo-unit.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

describe('MongoUnitRepository soft delete', () => {
  const UNIT_ID = '65f0c8bf0d4f3a6f9b6a1201';
  const PROPERTY_ID = '65f0c8bf0d4f3a6f9b6a1202';
  const TENANT_ID = '65f0c8bf0d4f3a6f9b6a1203';

  let repository: MongoUnitRepository;
  let unitModel: {
    findOne: jest.Mock;
    find: jest.Mock;
    countDocuments: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(() => {
    unitModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      create: jest.fn(),
    };

    repository = new MongoUnitRepository(unitModel as any);
  });

  it('findById filters out soft-deleted units', async () => {
    unitModel.findOne.mockResolvedValue(null);

    await repository.findById(UnitId.create(UNIT_ID));

    expect(unitModel.findOne).toHaveBeenCalledWith({
      _id: UNIT_ID,
      deletedAt: null,
    });
  });

  it('findByPropertyId applies deletedAt filter', async () => {
    const sort = jest.fn().mockResolvedValue([]);
    unitModel.find.mockReturnValue({ sort });

    await repository.findByPropertyId(PropertyId.create(PROPERTY_ID));

    expect(unitModel.find).toHaveBeenCalledTimes(1);
    const filter = unitModel.find.mock.calls[0][0];
    expect(filter).toMatchObject({ deletedAt: null });
    expect(filter.propertyId).toBeInstanceOf(Types.ObjectId);
    expect(filter.propertyId.toString()).toBe(PROPERTY_ID);
  });

  it('findByTenantIdPaginated only counts and returns non-deleted units', async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });

    unitModel.countDocuments.mockResolvedValue(0);
    unitModel.find.mockReturnValue({ sort });

    await repository.findByTenantIdPaginated(
      TenantId.createFromString(TENANT_ID),
      2,
      10,
    );

    const countFilter = unitModel.countDocuments.mock.calls[0][0];
    const findFilter = unitModel.find.mock.calls[0][0];

    expect(countFilter).toMatchObject({ deletedAt: null });
    expect(findFilter).toMatchObject({ deletedAt: null });
    expect(countFilter.tenantId).toBeInstanceOf(Types.ObjectId);
    expect(countFilter.tenantId.toString()).toBe(TENANT_ID);
    expect(skip).toHaveBeenCalledWith(10);
    expect(limit).toHaveBeenCalledWith(10);
  });

  it('countByTenantId excludes soft-deleted units', async () => {
    unitModel.countDocuments.mockResolvedValue(3);

    await repository.countByTenantId(TenantId.createFromString(TENANT_ID));

    const filter = unitModel.countDocuments.mock.calls[0][0];
    expect(filter).toMatchObject({ deletedAt: null });
    expect(filter.tenantId).toBeInstanceOf(Types.ObjectId);
    expect(filter.tenantId.toString()).toBe(TENANT_ID);
  });

  it('delete performs soft delete by setting deletedAt and updatedAt', async () => {
    unitModel.findByIdAndUpdate.mockResolvedValue(null);

    await repository.delete(UnitId.create(UNIT_ID));

    expect(unitModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(unitModel.findByIdAndUpdate).toHaveBeenCalledWith(
      UNIT_ID,
      expect.objectContaining({
        deletedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
  });
});
