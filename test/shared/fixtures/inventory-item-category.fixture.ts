import { InventoryItemCategory } from '@/domain/inventory/entities/inventory-item-category.entity';
import { InventoryItemCategoryId } from '@/domain/inventory/value-objects/inventory-item-category-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export const INVENTORY_ITEM_CATEGORY_FIXTURE_DEFAULTS = {
  id: '6650a1b2c3d4e5f6a7b8c9d0',
  tenantId: '5540a0b1c2d3e4f5a6b7c8d9',
  name: 'Limpieza',
  description: 'Productos de limpieza general',
};

export function makeInventoryItemCategory(
  overrides?: Partial<typeof INVENTORY_ITEM_CATEGORY_FIXTURE_DEFAULTS>,
): InventoryItemCategory {
  const merged = { ...INVENTORY_ITEM_CATEGORY_FIXTURE_DEFAULTS, ...overrides };
  return InventoryItemCategory.reconstitute({
    id: InventoryItemCategoryId.create(merged.id),
    tenantId: TenantId.createFromString(merged.tenantId),
    name: merged.name,
    description: merged.description,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });
}
