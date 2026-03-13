import { InventoryItemDto } from '@/application/inventory/queries/shared/inventory-item.dto';

export class GetInventoryItemsByPropertyResult {
  constructor(public readonly items: InventoryItemDto[]) {}
}
