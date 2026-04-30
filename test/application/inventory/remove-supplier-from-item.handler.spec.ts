import { NotFoundException } from '@nestjs/common';
import { RemoveSupplierFromItemHandler } from '@/application/inventory/commands/remove-supplier-from-item/remove-supplier-from-item.handler';
import { RemoveSupplierFromItemCommand } from '@/application/inventory/commands/remove-supplier-from-item/remove-supplier-from-item.command';
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

describe('RemoveSupplierFromItemHandler', () => {
  let handler: RemoveSupplierFromItemHandler;
  let inventoryItemRepository: jest.Mocked<InventoryItemRepository>;
  let propertyRepository: jest.Mocked<PropertyRepository>;
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let eventEmitter: ReturnType<typeof createEventEmitterMock>;

  beforeEach(() => {
    inventoryItemRepository = createInventoryItemRepositoryMock();
    propertyRepository = createPropertyRepositoryMock();
    supplierRepository = createSupplierRepositoryMock();
    eventEmitter = createEventEmitterMock();

    handler = new RemoveSupplierFromItemHandler(
      inventoryItemRepository,
      propertyRepository,
      supplierRepository,
      eventEmitter as any,
    );
  });

  it('removes the supplier from an inventory item', async () => {
    propertyRepository.findById.mockResolvedValue(
      makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9c1', tenantId: '65f1a1a2b3c4d5e6f7a8b9c0' }),
    );
    inventoryItemRepository.findById.mockResolvedValue(
      makeInventoryItem({
        id: 'item-123',
        tenantId: '65f1a1a2b3c4d5e6f7a8b9c0',
        propertyId: '65f1a1a2b3c4d5e6f7a8b9c1',
        supplierId: '65f1a1a2b3c4d5e6f7a8b9c4',
      }),
    );
    supplierRepository.findById.mockResolvedValue(
      makeSupplier({ id: '65f1a1a2b3c4d5e6f7a8b9c4', tenantId: '65f1a1a2b3c4d5e6f7a8b9c0' }),
    );
    inventoryItemRepository.save.mockResolvedValue('item-123');
    supplierRepository.save.mockResolvedValue('65f1a1a2b3c4d5e6f7a8b9c4');

    const result = await handler.execute(
      new RemoveSupplierFromItemCommand(
        '65f1a1a2b3c4d5e6f7a8b9c0',
        '65f1a1a2b3c4d5e6f7a8b9c1',
        'item-123',
        'admin-user-id',
        'admin@example.com',
      ),
    );

    expect(result.itemId).toBe('item-123');

    const savedItem = inventoryItemRepository.save.mock.calls[0][0];
    expect(savedItem.getSupplierId()).toBeNull();
    expect(supplierRepository.save).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ entityType: 'SUPPLIER' }),
    );
  });

  it('removes the supplier without touching supplier persistence when none is linked', async () => {
    propertyRepository.findById.mockResolvedValue(
      makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9c1', tenantId: '65f1a1a2b3c4d5e6f7a8b9c0' }),
    );
    inventoryItemRepository.findById.mockResolvedValue(
      makeInventoryItem({
        id: 'item-123',
        tenantId: '65f1a1a2b3c4d5e6f7a8b9c0',
        propertyId: '65f1a1a2b3c4d5e6f7a8b9c1',
      }),
    );
    inventoryItemRepository.save.mockResolvedValue('item-123');

    await handler.execute(
      new RemoveSupplierFromItemCommand(
        '65f1a1a2b3c4d5e6f7a8b9c0',
        '65f1a1a2b3c4d5e6f7a8b9c1',
        'item-123',
        'admin-user-id',
        'admin@example.com',
      ),
    );

    expect(supplierRepository.findById).not.toHaveBeenCalled();
    expect(supplierRepository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the item does not exist', async () => {
    propertyRepository.findById.mockResolvedValue(
      makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9c1', tenantId: '65f1a1a2b3c4d5e6f7a8b9c0' }),
    );
    inventoryItemRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(
        new RemoveSupplierFromItemCommand(
          '65f1a1a2b3c4d5e6f7a8b9c0',
          '65f1a1a2b3c4d5e6f7a8b9c1',
          'item-123',
          'admin-user-id',
          'admin@example.com',
        ),
      ),
    ).rejects.toThrow(NotFoundException);

    expect(inventoryItemRepository.save).not.toHaveBeenCalled();
  });
});
