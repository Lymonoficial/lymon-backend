import { Email } from '@/domain/tenant/value-objects/email.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export type UserScope =
  | { type: 'TENANT' }
  | { type: 'PROPERTY'; resourceIds: string[] }
  | { type: 'UNIT'; resourceIds: string[] };

/**
 * A single role+resource assignment.
 * One user can have multiple of these — e.g. ADMIN on Property X, VIEWER on Property Y.
 */
export interface RoleAssignment {
  roleId: string;
  scope: UserScope;
}

/** Kept for OWNER identity checks only. Staff roles are managed via RoleAssignment. */
export enum UserRoleEnum {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
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
    private readonly isOwnerFlag: boolean,
    private roleAssignments: RoleAssignment[],
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
      true,
      [],
      false,
      new Date(),
      new Date(),
    );
  }

  static createStaff(
    email: Email,
    passwordHash: string,
    tenantId: TenantId,
    roleAssignments: RoleAssignment[],
  ): User {
    return new User(
      null,
      email,
      passwordHash,
      tenantId,
      false,
      roleAssignments,
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
    isOwnerFlag: boolean,
    roleAssignments: RoleAssignment[],
    emailVerified: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(
      id,
      email,
      passwordHash,
      tenantId,
      isOwnerFlag,
      roleAssignments,
      emailVerified,
      createdAt,
      updatedAt,
    );
  }

  verifyEmail(): void {
    this.emailVerified = true;
    this.updatedAt = new Date();
  }

  updateRoleAssignments(roleAssignments: RoleAssignment[]): void {
    this.roleAssignments = roleAssignments;
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

  /** @deprecated Use isOwner() for identity checks; use roleAssignments for permission checks */
  getRole(): UserRoleEnum {
    return this.isOwnerFlag ? UserRoleEnum.OWNER : UserRoleEnum.STAFF;
  }

  getRoleAssignments(): RoleAssignment[] {
    return [...this.roleAssignments];
  }

  isOwner(): boolean {
    return this.isOwnerFlag;
  }
}

