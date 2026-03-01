import { Role, RoleId } from '@/domain/role/entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface RoleRepository {
  save(role: Role): Promise<void>;
  findById(id: RoleId): Promise<Role | null>;
  findSystemRoles(): Promise<Role[]>;
}
