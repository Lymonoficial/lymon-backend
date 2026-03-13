import { InventoryItem } from '@/domain/inventory/entities/inventory-item.entity';
import { InventoryItemId } from '@/domain/inventory/value-objects/inventory-item-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PROPERTY_FIXTURE_DEFAULTS } from '@test/shared/fixtures/property.fixture';
import { TENANT_FIXTURE_DEFAULTS } from '@test/shared/fixtures/tenant.fixture';
import { randomUUID } from 'crypto';

export const INVENTORY_ITEM_FIXTURE_DEFAULTS = {
  id: randomUUID(),
  tenantId: TENANT_FIXTURE_DEFAULTS.id,
  propertyId: PROPERTY_FIXTURE_DEFAULTS.id,
  sku: 'SKU-001',
  name: 'Toalla',
  category: 'Limpieza',
  unit: 'unidad',
  minStock: 5,
  currentStock: 20,
};

export function makeInventoryItem(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    propertyId: string;
    sku: string;
    name: string;
    category: string;
    unit: string;
    minStock: number;
    currentStock: number;
  }>,
): InventoryItem {
  const merged = { ...INVENTORY_ITEM_FIXTURE_DEFAULTS, ...overrides };

  return InventoryItem.reconstitute(
    InventoryItemId.create(merged.id),
    TenantId.createFromString(merged.tenantId),
    PropertyId.create(merged.propertyId),
    merged.sku,
    merged.name,
    merged.category,
    merged.unit,
    merged.minStock,
    merged.currentStock,
    new Date(),
    new Date(),
  );
}
