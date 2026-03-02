import { Email } from '@/domain/shared/value-objects/email.vo';
import { PlanType } from '@/domain/tenant/value-objects/plan-type.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export class Tenant {
  private constructor(
    private readonly id: TenantId | null,
    private name: string,
    private readonly ownerEmail: Email,
    private plan: PlanType,
    private emailVerified: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(name: string, ownerEmail: Email, plan: PlanType): Tenant {
    if (!name || name.trim() === '') {
      throw new Error('Tenant name cannot be empty');
    }

    return new Tenant(
      null,
      name.trim(),
      ownerEmail,
      plan,
      false,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    id: TenantId,
    name: string,
    ownerEmail: Email,
    plan: PlanType,
    emailVerified: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): Tenant {
    return new Tenant(
      id,
      name,
      ownerEmail,
      plan,
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

  changePlan(newPlan: PlanType): void {
    this.plan = newPlan;
    this.updatedAt = new Date();
  }

  getId(): TenantId | null {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getOwnerEmail(): Email {
    return this.ownerEmail;
  }

  getPlan(): PlanType {
    return this.plan;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
