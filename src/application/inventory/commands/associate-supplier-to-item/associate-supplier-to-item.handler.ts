import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssociateSupplierToItemCommand } from './associate-supplier-to-item.command';
import { AssociateSupplierToItemResult } from './associate-supplier-to-item.result';
import {
  INVENTORY_ITEM_REPOSITORY,
  type InventoryItemRepository,
} from '@/domain/inventory/repositories/inventory-item.repository';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '@/domain/inventory/repositories/supplier.repository';
import { Supplier } from '@/domain/inventory/entities/supplier.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { InventoryItemId } from '@/domain/inventory/value-objects/inventory-item-id.vo';
import { SupplierId } from '@/domain/inventory/value-objects/supplier-id.vo';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AUDIT_LOG_EVENT,
  AuditLoggedEvent,
} from '@/infrastructure/audit/events/audit-logged.event';

type InventoryItemWithSupplierAssociation = {
  associateSupplier(supplierId: SupplierId): void;
  getSupplierId(): SupplierId | null;
};

@CommandHandler(AssociateSupplierToItemCommand)
export class AssociateSupplierToItemHandler implements ICommandHandler<
  AssociateSupplierToItemCommand,
  AssociateSupplierToItemResult
> {
  constructor(
    @Inject(INVENTORY_ITEM_REPOSITORY)
    private readonly inventoryItemRepository: InventoryItemRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: AssociateSupplierToItemCommand,
  ): Promise<AssociateSupplierToItemResult> {
    const tenantId = TenantId.createFromString(command.tenantId);
    const propertyId = PropertyId.create(command.propertyId);
    const itemId = InventoryItemId.create(command.itemId);
    const supplierId = SupplierId.create(command.supplierId);

    const property = await this.propertyRepository.findById(propertyId);
    if (property?.getTenantId().toString() !== tenantId.toString()) {
      throw new NotFoundException('Property not found');
    }

    const item = await this.inventoryItemRepository.findById(itemId);
    if (
      item?.getTenantId().toString() !== tenantId.toString() ||
      item?.getPropertyId().toString() !== propertyId.toString()
    ) {
      throw new NotFoundException('Inventory item not found');
    }

    const inventoryItem = item as InventoryItemWithSupplierAssociation;

    const supplier = await this.supplierRepository.findById(supplierId);
    if (supplier?.getTenantId().toString() !== tenantId.toString()) {
      throw new NotFoundException('Supplier not found');
    }

    const previousSnapshot = this.getItemSupplierSnapshot(inventoryItem);

    inventoryItem.associateSupplier(supplierId);
    const nextSnapshot = this.getItemSupplierSnapshot(inventoryItem);
    const auditDiff = this.buildAuditDiff(previousSnapshot, nextSnapshot);

    await this.inventoryItemRepository.save(item);

    const refreshedSupplier = this.refreshSupplierMetadata(
      supplier,
      supplierId,
    );
    await this.supplierRepository.save(refreshedSupplier);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId ?? '',
        command.actorEmail ?? '',
        AuditAction.SUPPLIER_UPDATED,
        AuditEntityType.SUPPLIER,
        command.supplierId,
        auditDiff.changedFields.length > 0
          ? { changedFields: auditDiff.changedFields }
          : undefined,
        auditDiff.previousValue,
        auditDiff.newValue,
      ),
    );

    return new AssociateSupplierToItemResult(
      itemId.toString(),
      supplierId.toString(),
    );
  }

  private refreshSupplierMetadata(
    supplier: {
      getId(): { toString(): string } | null;
      getTenantId(): TenantId;
      getName(): string;
      getContactEmail(): string;
      getContactPhone(): string;
      getCountry(): string;
      getCity(): string;
      getNit(): string;
      getCreatedAt(): Date;
      getDeletedAt(): Date | null;
    },
    supplierId: SupplierId,
  ) {
    return Supplier.reconstitute({
      id: supplierId,
      tenantId: supplier.getTenantId(),
      name: supplier.getName(),
      contactEmail: supplier.getContactEmail(),
      contactPhone: supplier.getContactPhone(),
      country: supplier.getCountry(),
      city: supplier.getCity(),
      nit: supplier.getNit(),
      createdAt: supplier.getCreatedAt(),
      updatedAt: new Date(),
      deletedAt: supplier.getDeletedAt(),
    });
  }

  private getItemSupplierSnapshot(item: {
    getSupplierId(): SupplierId | null;
  }): Record<string, unknown> {
    return {
      supplierId: item.getSupplierId()?.toString() ?? null,
    };
  }

  private buildAuditDiff(
    previousSnapshot: Record<string, unknown>,
    nextSnapshot: Record<string, unknown>,
  ): {
    changedFields: string[];
    previousValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
  } {
    const changedFields: string[] = [];
    const previousValue: Record<string, unknown> = {};
    const newValue: Record<string, unknown> = {};

    for (const field of Object.keys(nextSnapshot)) {
      const previousFieldValue = previousSnapshot[field];
      const nextFieldValue = nextSnapshot[field];

      if (previousFieldValue === nextFieldValue) {
        continue;
      }

      changedFields.push(field);
      previousValue[field] = previousFieldValue;
      newValue[field] = nextFieldValue;
    }

    return {
      changedFields,
      previousValue: changedFields.length > 0 ? previousValue : undefined,
      newValue: changedFields.length > 0 ? newValue : undefined,
    };
  }
}
