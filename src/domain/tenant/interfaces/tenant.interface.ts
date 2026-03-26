import { Email } from '@/domain/shared/value-objects/email.vo';
import { PlanType } from '@/domain/tenant/value-objects/plan-type.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export interface ITenant {
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
}
