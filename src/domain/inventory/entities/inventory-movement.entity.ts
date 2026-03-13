import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { InventoryItemId } from '@/domain/inventory/value-objects/inventory-item-id.vo';
import { InventoryMovementId } from '@/domain/inventory/value-objects/inventory-movement-id.vo';
import { InventoryMovementType } from '@/domain/inventory/value-objects/inventory-movement-type.vo';

export class InventoryMovement {
  private constructor(
    private readonly id: InventoryMovementId | null,
    private readonly tenantId: TenantId,
    private readonly propertyId: PropertyId,
    private readonly itemId: InventoryItemId,
    private readonly type: InventoryMovementType,
    private readonly quantity: number,
    private readonly reason: string,
    private readonly reference: string | null,
    private readonly actorId: string,
    private readonly actorEmail: string,
    private readonly createdAt: Date,
  ) {}

  static create(params: {
    tenantId: TenantId;
    propertyId: PropertyId;
    itemId: InventoryItemId;
    type: InventoryMovementType;
    quantity: number;
    reason: string;
    reference?: string | null;
    actorId: string;
    actorEmail: string;
  }): InventoryMovement {
    return new InventoryMovement(
      null,
      params.tenantId,
      params.propertyId,
      params.itemId,
      params.type,
      params.quantity,
      params.reason,
      params.reference ?? null,
      params.actorId,
      params.actorEmail,
      new Date(),
    );
  }

  static reconstitute(
    id: InventoryMovementId,
    tenantId: TenantId,
    propertyId: PropertyId,
    itemId: InventoryItemId,
    type: InventoryMovementType,
    quantity: number,
    reason: string,
    reference: string | null,
    actorId: string,
    actorEmail: string,
    createdAt: Date,
  ): InventoryMovement {
    return new InventoryMovement(
      id,
      tenantId,
      propertyId,
      itemId,
      type,
      quantity,
      reason,
      reference,
      actorId,
      actorEmail,
      createdAt,
    );
  }

  getId(): InventoryMovementId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getPropertyId(): PropertyId {
    return this.propertyId;
  }

  getItemId(): InventoryItemId {
    return this.itemId;
  }

  getType(): InventoryMovementType {
    return this.type;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getReason(): string {
    return this.reason;
  }

  getReference(): string | null {
    return this.reference;
  }

  getActorId(): string {
    return this.actorId;
  }

  getActorEmail(): string {
    return this.actorEmail;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
