import { randomUUID } from 'node:crypto';
import { Supplier } from '@/domain/inventory/entities/supplier.entity';
import { SupplierId } from '@/domain/inventory/value-objects/supplier-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { TENANT_FIXTURE_DEFAULTS } from '@test/shared/fixtures/tenant.fixture';

export const SUPPLIER_FIXTURE_DEFAULTS = {
  id: randomUUID(),
  tenantId: TENANT_FIXTURE_DEFAULTS.id,
  name: 'Fresh Supplies Inc.',
  contactEmail: 'contact@freshsupplies.com',
  contactPhone: '+12025550123',
  country: 'Colombia',
  city: 'Bogotá',
  nit: 'NIT-123456789',
};

export function makeSupplier(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    name: string;
    contactEmail: string;
    contactPhone: string;
    country: string;
    city: string;
    nit: string;
  }>,
): Supplier {
  const merged = { ...SUPPLIER_FIXTURE_DEFAULTS, ...overrides };

  return Supplier.reconstitute(
    SupplierId.create(merged.id),
    TenantId.createFromString(merged.tenantId),
    merged.name,
    merged.contactEmail,
    merged.contactPhone,
    merged.country,
    merged.city,
    merged.nit,
    new Date(),
    new Date(),
    null,
  );
}
