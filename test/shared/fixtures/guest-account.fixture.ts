import { GuestAccount } from '@/domain/guest-account/entities/guest-account.entity';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { GuestAccountStatusEnum } from '@/domain/guest-account/value-objects/guest-account-status.vo';
import { Email } from '@/domain/shared/value-objects/email.vo';

export const GUEST_ACCOUNT_FIXTURE_DEFAULTS = {
  id: 'guest-123',
  email: 'guest@example.com',
  passwordHash: 'hashed-password',
  fullName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  status: GuestAccountStatusEnum.PENDING_VERIFICATION,
  emailVerified: false,
};

export function makeGuestAccount(
  overrides?: Partial<{
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    firstName: string | null;
    lastName: string | null;
    status: GuestAccountStatusEnum;
    emailVerified: boolean;
  }>,
): GuestAccount {
  const merged = { ...GUEST_ACCOUNT_FIXTURE_DEFAULTS, ...overrides };
  return GuestAccount.reconstitute(
    GuestAccountId.createFromString(merged.id),
    Email.create(merged.email),
    merged.passwordHash,
    merged.fullName,
    merged.firstName,
    merged.lastName,
    merged.status,
    merged.emailVerified,
    null,
    null,
    null,
    null,
    null,
    new Date(),
    new Date(),
  );
}
