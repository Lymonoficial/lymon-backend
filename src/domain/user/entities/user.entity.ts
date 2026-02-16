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
    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
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
