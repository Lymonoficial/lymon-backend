import {
  Tenant,
  TenantReconstitutionProps,
} from '@/domain/tenant/entities/tenant.entity';
import { Email } from '@/domain/shared/value-objects/email.vo';
import {
  PlanType,
  PlanTypeEnum,
} from '@/domain/tenant/value-objects/plan-type.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export const TENANT_FIXTURE_DEFAULTS = {
  id: 'tenant-123',
  name: 'Acme Corp',
  ownerEmail: 'owner@example.com',
  plan: PlanTypeEnum.TRIAL,
  emailVerified: true,
  contactPhone: null as string | null,
  address: null as string | null,
  website: null as string | null,
  logoUrl: null as string | null,
};

export function makeTenant(
  overrides?: Partial<{
    id: string;
    name: string;
    ownerEmail: string;
    plan: PlanTypeEnum;
    emailVerified: boolean;
    contactPhone: string | null;
    address: string | null;
    website: string | null;
    logoUrl: string | null;
  }>,
): Tenant {
  const merged = { ...TENANT_FIXTURE_DEFAULTS, ...overrides };
  const props: TenantReconstitutionProps = {
    id: TenantId.createFromString(merged.id),
    name: merged.name,
    ownerEmail: Email.create(merged.ownerEmail),
    plan: PlanType.create(merged.plan),
    emailVerified: merged.emailVerified,
    contactPhone: merged.contactPhone,
    address: merged.address,
    website: merged.website,
    logoUrl: merged.logoUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return Tenant.reconstitute(props);
}
