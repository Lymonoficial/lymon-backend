import { NotFoundException } from '@nestjs/common';
import { AssociateSupplierToItemHandler } from '@/application/inventory/commands/associate-supplier-to-item/associate-supplier-to-item.handler';
import { AssociateSupplierToItemCommand } from '@/application/inventory/commands/associate-supplier-to-item/associate-supplier-to-item.command';
import { InventoryItemRepository } from '@/domain/inventory/repositories/inventory-item.repository';
import { PropertyRepository } from '@/domain/property/repositories/property.repository';
import { SupplierRepository } from '@/domain/inventory/repositories/supplier.repository';
import { createInventoryItemRepositoryMock } from '@test/shared/mocks/repositories/inventory-item-repository.mock';
import { createPropertyRepositoryMock } from '@test/shared/mocks/repositories/property-repository.mock';
import { createSupplierRepositoryMock } from '@test/shared/mocks/repositories/supplier-repository.mock';
import { createEventEmitterMock } from '@test/shared/mocks/services/event-emitter.mock';
import { makeProperty } from '@test/shared/fixtures/property.fixture';
import { makeInventoryItem } from '@test/shared/fixtures/inventory-item.fixture';
import { makeSupplier } from '@test/shared/fixtures/supplier.fixture';

describe('AssociateSupplierToItemHandler', () => {
  let handler: AssociateSupplierToItemHandler;
  let inventoryItemRepository: jest.Mocked<InventoryItemRepository>;
  let propertyRepository: jest.Mocked<PropertyRepository>;
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let eventEmitter: ReturnType<typeof createEventEmitterMock>;

  beforeEach(() => {
    inventoryItemRepository = createInventoryItemRepositoryMock();
    propertyRepository = createPropertyRepositoryMock();
    supplierRepository = createSupplierRepositoryMock();
    eventEmitter = createEventEmitterMock();

    handler = new AssociateSupplierToItemHandler(
      inventoryItemRepository,
      propertyRepository,
      supplierRepository,
      eventEmitter as any,
    );
  });

  it('associates a supplier to an inventory item', async () => {
    propertyRepository.findById.mockResolvedValue(
      makeProperty({ id: 'property-123', tenantId: 'tenant-123' }),
    );
    inventoryItemRepository.findById.mockResolvedValue(
      makeInventoryItem({
        id: 'item-123',
        tenantId: 'tenant-123',
        propertyId: 'property-123',
      }),
    );
    supplierRepository.findById.mockResolvedValue(
      makeSupplier({ id: 'supplier-123', tenantId: 'tenant-123' }),
    );
    inventoryItemRepository.save.mockResolvedValue('item-123');
    supplierRepository.save.mockResolvedValue('supplier-123');

    const result = await handler.execute(
      new AssociateSupplierToItemCommand(
        'tenant-123',
        'property-123',
        'item-123',
        'supplier-123',
        'admin-user-id',
        'admin@example.com',
      ),
    );

    expect(result.itemId).toBe('item-123');
    expect(result.supplierId).toBe('supplier-123');

    const savedItem = inventoryItemRepository.save.mock.calls[0][0];
    expect(savedItem.getSupplierId()?.toString()).toBe('supplier-123');

    expect(supplierRepository.save).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ entityType: 'SUPPLIER' }),
    );
  });

  it('throws NotFoundException when the supplier does not exist', async () => {
    propertyRepository.findById.mockResolvedValue(
      makeProperty({ id: 'property-123', tenantId: 'tenant-123' }),
    );
    inventoryItemRepository.findById.mockResolvedValue(
      makeInventoryItem({
        id: 'item-123',
        tenantId: 'tenant-123',
        propertyId: 'property-123',
      }),
    );
    supplierRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(
        new AssociateSupplierToItemCommand(
          'tenant-123',
          'property-123',
          'item-123',
          'supplier-123',
          'admin-user-id',
          'admin@example.com',
        ),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(inventoryItemRepository.save).not.toHaveBeenCalled();
    expect(supplierRepository.save).not.toHaveBeenCalled();
  });
});
