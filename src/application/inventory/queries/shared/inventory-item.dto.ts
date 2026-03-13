export class InventoryItemDto {
  constructor(
    public readonly id: string,
    public readonly sku: string,
    public readonly name: string,
    public readonly category: string,
    public readonly unit: string,
    public readonly minStock: number,
    public readonly currentStock: number,
    public readonly lowStock: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export const toInventoryItemDto = (item: {
  getId(): { toString(): string } | null;
  getSku(): string;
  getName(): string;
  getCategory(): string;
  getUnit(): string;
  getMinStock(): number;
  getCurrentStock(): number;
  isLowStock(): boolean;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
}): InventoryItemDto =>
  new InventoryItemDto(
    item.getId()?.toString() ?? '',
    item.getSku(),
    item.getName(),
    item.getCategory(),
    item.getUnit(),
    item.getMinStock(),
    item.getCurrentStock(),
    item.isLowStock(),
    item.getCreatedAt(),
    item.getUpdatedAt(),
  );
