import { Email } from '@/domain/tenant/value-objects/email.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export enum UserRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export class UserId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static createFromString(value: string): UserId {
    if (!value || value.trim() === '') {
      throw new Error('UserId cannot be empty');
    }
    return new UserId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

export class User {
  private constructor(
    private readonly id: UserId | null,
    private readonly email: Email,
    private passwordHash: string,
    private readonly tenantId: TenantId,
    private readonly role: UserRoleEnum,
    private emailVerified: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private resetPasswordToken?: string,
    private resetPasswordExpires?: Date,
    private passwordChangedAt?: Date,
  ) {}

  static createOwner(
    email: Email,
    passwordHash: string,
    tenantId: TenantId,
  ): User {
    return new User(
      null,
      email,
      passwordHash,
      tenantId,
      UserRoleEnum.OWNER,
      false,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    id: UserId,
    email: Email,
    passwordHash: string,
    tenantId: TenantId,
    role: UserRoleEnum,
    emailVerified: boolean,
    createdAt: Date,
    updatedAt: Date,
    resetPasswordToken?: string,
    resetPasswordExpires?: Date,
    passwordChangedAt?: Date,
  ): User {
    return new User(
      id,
      email,
      passwordHash,
      tenantId,
      role,
      emailVerified,
      createdAt,
      updatedAt,
      resetPasswordToken,
      resetPasswordExpires,
      passwordChangedAt,
    );
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  isEmailVerified(): boolean {
    return this.emailVerified;
  }

  getId(): UserId | null {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  changePassword(newPasswordHash: string): void {
    if (!newPasswordHash || newPasswordHash.trim() === '') {
      throw new Error('Password hash cannot be empty');
    }

    this.passwordHash = newPasswordHash;
    this.passwordChangedAt = new Date();
    this.updatedAt = new Date();
  }

  setResetToken(hashedToken: string, expiresAt: Date): void {
    if (!hashedToken || hashedToken.trim() === '') {
      throw new Error('Reset token cannot be empty');
    }

    const now = new Date();
    if (expiresAt <= now) {
      throw new Error('Reset token expiration must be in the future');
    }

    this.resetPasswordToken = hashedToken;
    this.resetPasswordExpires = expiresAt;
    this.updatedAt = new Date();
  }

  getResetPasswordToken(): string | undefined {
    return this.resetPasswordToken;
  }

  getResetPasswordExpires(): Date | undefined {
    return this.resetPasswordExpires;
  }

  resetPasswordWithToken(newPasswordHash: string, currentDate: Date): void {
    if (!this.isResetTokenValid(currentDate)) {
      throw new Error('Reset token is invalid or expired');
    }

    this.changePassword(newPasswordHash);
    this.clearResetToken();
  }

  clearResetToken(): void {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
    this.updatedAt = new Date();
  }

  isResetTokenValid(currentDate: Date): boolean {
    if (!this.resetPasswordToken || !this.resetPasswordExpires) {
      return false;
    }
    return currentDate <= this.resetPasswordExpires;
  }

  getPasswordChangedAt(): Date | undefined {
    return this.passwordChangedAt;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getRole(): UserRoleEnum {
    return this.role;
  }

  isOwner(): boolean {
    return this.role === UserRoleEnum.OWNER;
  }
}
