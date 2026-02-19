import { TenantRepository } from '@/domain/tenant/repositories/tenant.repository';

export function createTenantRepositoryMock(): jest.Mocked<TenantRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByOwnerEmail: jest.fn(),
    exists: jest.fn(),
  };
}
