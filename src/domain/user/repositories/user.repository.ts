import { Email } from '@/domain/shared/value-objects/email.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { User, UserId } from '@/domain/user/entities/user.entity';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByTenantId(tenantId: TenantId): Promise<User[]>;
  findByEmailAndTenantId(
    email: Email,
    tenantId: TenantId,
  ): Promise<User | null>;
  findByResetToken(hashedToken: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
