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
  emailVerificationToken: null as string | null,
  emailVerificationExpiry: null as Date | null,
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
    emailVerificationToken: string | null;
    emailVerificationExpiry: Date | null;
  }>,
): GuestAccount {
  const merged = { ...GUEST_ACCOUNT_FIXTURE_DEFAULTS, ...overrides };
  return GuestAccount.reconstitute({
    id: GuestAccountId.createFromString(merged.id),
    email: Email.create(merged.email),
    passwordHash: merged.passwordHash,
    fullName: merged.fullName,
    firstName: merged.firstName,
    lastName: merged.lastName,
    status: merged.status,
    emailVerified: merged.emailVerified,
    emailVerificationToken: merged.emailVerificationToken,
    emailVerificationExpiry: merged.emailVerificationExpiry,
    passwordResetToken: null,
    passwordResetExpiry: null,
    passwordChangedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
