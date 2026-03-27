import { GuestAccountStatusEnum } from '../value-objects/guest-account-status.vo';

export interface IGuestAccount {
  emailVerified: boolean;
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  status: GuestAccountStatusEnum;
  emailVerificationToken: string | null;
  emailVerificationExpiry: Date | null;
  passwordResetToken: string | null;
  passwordResetExpiry: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
