import { Email } from '@/domain/shared/value-objects/email.vo';
import { PlanType } from '@/domain/tenant/value-objects/plan-type.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export interface TenantReconstitutionProps {
  id: TenantId;
  name: string;
  ownerEmail: Email;
  plan: PlanType;
  emailVerified: boolean;
  contactPhone: string | null;
  address: string | null;
  website: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class Tenant {
  private constructor(
    private readonly id: TenantId | null,
    private name: string,
    private readonly ownerEmail: Email,
    private plan: PlanType,
    private emailVerified: boolean,
    private contactPhone: string | null,
    private address: string | null,
    private website: string | null,
    private logoUrl: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null = null,
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
      null,
      null,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(props: TenantReconstitutionProps): Tenant {
    return new Tenant(
      props.id,
      props.name,
      props.ownerEmail,
      props.plan,
      props.emailVerified,
      props.contactPhone,
      props.address,
      props.website,
      props.logoUrl,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
    );
  }

  delete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
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

  updateProfile(
    name?: string,
    contactPhone?: string | null,
    address?: string | null,
    website?: string | null,
    logoUrl?: string | null,
  ): void {
    if (name !== undefined) {
      if (!name || name.trim() === '') {
        throw new Error('Tenant name cannot be empty');
      }
      this.name = name.trim();
    }
    if (contactPhone !== undefined) this.contactPhone = contactPhone;
    if (address !== undefined) this.address = address;
    if (website !== undefined) this.website = website;
    if (logoUrl !== undefined) this.logoUrl = logoUrl;
    this.updatedAt = new Date();
  }

  getId(): TenantId | null {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getContactPhone(): string | null {
    return this.contactPhone;
  }

  getAddress(): string | null {
    return this.address;
  }

  getWebsite(): string | null {
    return this.website;
  }

  getLogoUrl(): string | null {
    return this.logoUrl;
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
