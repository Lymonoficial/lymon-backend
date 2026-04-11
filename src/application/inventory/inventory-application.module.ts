import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { CreateInventoryItemHandler } from '@/application/inventory/commands/create-inventory-item/create-inventory-item.handler';
import { UpdateInventoryItemHandler } from '@/application/inventory/commands/update-inventory-item/update-inventory-item.handler';
import { RecordInventoryMovementHandler } from '@/application/inventory/commands/record-inventory-movement/record-inventory-movement.handler';
import { DeleteInventoryItemHandler } from '@/application/inventory/commands/delete-inventory-item/delete-inventory-item.handler';
import { CreateSupplierHandler } from '@/application/inventory/commands/create-supplier/create-supplier.handler';
import { UpdateSupplierHandler } from '@/application/inventory/commands/update-supplier/update-supplier.handler';
import { GetInventoryItemsByPropertyQueryHandler } from '@/application/inventory/queries/get-inventory-items-by-property/get-inventory-items-by-property.query-handler';
import { GetLowStockItemsByPropertyQueryHandler } from '@/application/inventory/queries/get-low-stock-items-by-property/get-low-stock-items-by-property.query-handler';

const CommandHandlers = [
  CreateInventoryItemHandler,
  UpdateInventoryItemHandler,
  RecordInventoryMovementHandler,
  DeleteInventoryItemHandler,
  CreateSupplierHandler,
  UpdateSupplierHandler,
];

const QueryHandlers = [
  GetInventoryItemsByPropertyQueryHandler,
  GetLowStockItemsByPropertyQueryHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class InventoryApplicationModule {}
