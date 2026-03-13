import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RecordInventoryMovementCommand } from './record-inventory-movement.command';
import { RecordInventoryMovementResult } from './record-inventory-movement.result';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { InventoryItemId } from '@/domain/inventory/value-objects/inventory-item-id.vo';
import {
  INVENTORY_ITEM_REPOSITORY,
  type InventoryItemRepository,
} from '@/domain/inventory/repositories/inventory-item.repository';
import {
  INVENTORY_MOVEMENT_REPOSITORY,
  type InventoryMovementRepository,
} from '@/domain/inventory/repositories/inventory-movement.repository';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import {
  TRANSACTION_MANAGER,
  type TransactionManager,
} from '@/domain/shared/transaction-manager.interface';
import { InventoryMovementType } from '@/domain/inventory/value-objects/inventory-movement-type.vo';
import { InventoryMovement } from '@/domain/inventory/entities/inventory-movement.entity';

@CommandHandler(RecordInventoryMovementCommand)
export class RecordInventoryMovementHandler implements ICommandHandler<
  RecordInventoryMovementCommand,
  RecordInventoryMovementResult
> {
  constructor(
    @Inject(INVENTORY_ITEM_REPOSITORY)
    private readonly inventoryItemRepository: InventoryItemRepository,
    @Inject(INVENTORY_MOVEMENT_REPOSITORY)
    private readonly inventoryMovementRepository: InventoryMovementRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(
    command: RecordInventoryMovementCommand,
  ): Promise<RecordInventoryMovementResult> {
    const tenantId = TenantId.createFromString(command.tenantId);
    const propertyId = PropertyId.create(command.propertyId);
    const itemId = InventoryItemId.create(command.itemId);

    const property = await this.propertyRepository.findById(propertyId);
    if (
      !property ||
      property.getTenantId().toString() !== tenantId.toString()
    ) {
      throw new NotFoundException('Property not found');
    }

    const movementType = this.parseMovementType(command.type);

    const result = await this.transactionManager.executeInTransaction(
      async (context) => {
        const item = await this.inventoryItemRepository.findById(itemId);
        if (
          !item ||
          item.getTenantId().toString() !== tenantId.toString() ||
          item.getPropertyId().toString() !== propertyId.toString()
        ) {
          throw new NotFoundException('Inventory item not found');
        }

        item.applyMovement(movementType, command.quantity);
        await this.inventoryItemRepository.save(item, context.getContext());

        const movement = InventoryMovement.create({
          tenantId,
          propertyId,
          itemId,
          type: movementType,
          quantity: command.quantity,
          reason: command.reason,
          reference: command.reference,
          actorId: command.actorId,
          actorEmail: command.actorEmail,
        });

        const movementId = await this.inventoryMovementRepository.save(
          movement,
          context.getContext(),
        );

        return {
          movementId,
          itemId: item.getId()?.toString() ?? '',
          currentStock: item.getCurrentStock(),
        };
      },
    );

    return new RecordInventoryMovementResult(
      result.movementId,
      result.itemId,
      result.currentStock,
    );
  }

  private parseMovementType(type: string): InventoryMovementType {
    if (type === 'IN') return InventoryMovementType.IN;
    if (type === 'OUT') return InventoryMovementType.OUT;
    if (type === 'ADJUSTMENT') return InventoryMovementType.ADJUSTMENT;
    throw new BadRequestException('Invalid movement type');
  }
}
