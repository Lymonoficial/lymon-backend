import { RoleRepository } from '@/domain/role/repositories/role.repository';

export function createRoleRepositoryMock(): jest.Mocked<RoleRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findSystemRoles: jest.fn(),
  };
}
