import { UnitRepository } from '@/domain/unit/repositories/unit.repository';

export function createUnitRepositoryMock(): jest.Mocked<UnitRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByTenantId: jest.fn(),
    findByPropertyId: jest.fn(),
    countByTenantId: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<UnitRepository>;
}
import { UnitRepository } from '@/domain/unit/repositories/unit.repository';

export function createUnitRepositoryMock(): jest.Mocked<UnitRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByPropertyId: jest.fn(),
    findByTenantId: jest.fn(),
    countByTenantId: jest.fn(),
    delete: jest.fn(),
  };
}
