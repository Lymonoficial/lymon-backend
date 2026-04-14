import { NotFoundException } from '@nestjs/common';
import { GetItemsBySupplierQueryHandler } from '@/application/inventory/queries/get-items-by-supplier/get-items-by-supplier.query-handler';
import { GetItemsBySupplierQuery } from '@/application/inventory/queries/get-items-by-supplier/get-items-by-supplier.query';
import { InventoryItemRepository } from '@/domain/inventory/repositories/inventory-item.repository';
import { SupplierRepository } from '@/domain/inventory/repositories/supplier.repository';
import { createInventoryItemRepositoryMock } from '@test/shared/mocks/repositories/inventory-item-repository.mock';
import { createSupplierRepositoryMock } from '@test/shared/mocks/repositories/supplier-repository.mock';
import { makeInventoryItem } from '@test/shared/fixtures/inventory-item.fixture';
import { makeSupplier } from '@test/shared/fixtures/supplier.fixture';

describe('GetItemsBySupplierQueryHandler', () => {
  let handler: GetItemsBySupplierQueryHandler;
  let inventoryItemRepository: jest.Mocked<InventoryItemRepository>;
  let supplierRepository: jest.Mocked<SupplierRepository>;

  beforeEach(() => {
    inventoryItemRepository = createInventoryItemRepositoryMock();
    supplierRepository = createSupplierRepositoryMock();

    handler = new GetItemsBySupplierQueryHandler(
      inventoryItemRepository,
      supplierRepository,
    );
  });

  it('returns items for the supplier with pagination metadata', async () => {
    supplierRepository.findById.mockResolvedValue(
      makeSupplier({ id: 'supplier-123', tenantId: 'tenant-123' }),
    );
    inventoryItemRepository.findBySupplierId.mockResolvedValue([
      makeInventoryItem({
        id: 'item-1',
        tenantId: 'tenant-123',
        supplierId: 'supplier-123',
      }),
      makeInventoryItem({
        id: 'item-2',
        tenantId: 'tenant-123',
        supplierId: 'supplier-123',
      }),
    ]);

    const result = await handler.execute(
      new GetItemsBySupplierQuery('tenant-123', 'supplier-123', 1, 10),
    );

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(inventoryItemRepository.findBySupplierId).toHaveBeenCalledWith(
      expect.objectContaining({ toString: expect.any(Function) }),
      expect.objectContaining({ toString: expect.any(Function) }),
    );
  });

  it('throws NotFoundException when the supplier does not exist', async () => {
    supplierRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(
        new GetItemsBySupplierQuery('tenant-123', 'supplier-123', 1, 10),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(inventoryItemRepository.findBySupplierId).not.toHaveBeenCalled();
  });
});
