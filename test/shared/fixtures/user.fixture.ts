import { User, UserId, UserRoleEnum } from '@/domain/user/entities/user.entity';
import { Email } from '@/domain/tenant/value-objects/email.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export const USER_FIXTURE_DEFAULTS = {
  id: 'user-456',
  email: 'owner@example.com',
  passwordHash: 'hashed-password',
  tenantId: 'tenant-123',
  role: UserRoleEnum.OWNER,
  emailVerified: true,
};

export function makeUser(
  overrides?: Partial<{
    id: string;
    email: string;
    passwordHash: string;
    tenantId: string;
    role: UserRoleEnum;
    emailVerified: boolean;
  }>,
): User {
  const merged = { ...USER_FIXTURE_DEFAULTS, ...overrides };
  return User.reconstitute(
    UserId.createFromString(merged.id),
    Email.create(merged.email),
    merged.passwordHash,
    TenantId.createFromString(merged.tenantId),
    merged.role,
    merged.emailVerified,
    new Date(),
    new Date(),
  );
}
