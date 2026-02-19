import { Tenant } from '@/domain/tenant/entities/tenant.entity';
import { Email } from '@/domain/tenant/value-objects/email.vo';
import { PlanType, PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export const TENANT_FIXTURE_DEFAULTS = {
  id: 'tenant-123',
  name: 'Acme Corp',
  ownerEmail: 'owner@example.com',
  plan: PlanTypeEnum.TRIAL,
  emailVerified: true,
};

export function makeTenant(
  overrides?: Partial<{
    id: string;
    name: string;
    ownerEmail: string;
    plan: PlanTypeEnum;
    emailVerified: boolean;
  }>,
): Tenant {
  const merged = { ...TENANT_FIXTURE_DEFAULTS, ...overrides };
  return Tenant.reconstitute(
    TenantId.createFromString(merged.id),
    merged.name,
    Email.create(merged.ownerEmail),
    PlanType.create(merged.plan),
    merged.emailVerified,
    new Date(),
    new Date(),
  );
}
