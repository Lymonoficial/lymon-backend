import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { InventoryMovementRepository } from '@/domain/inventory/repositories/inventory-movement.repository';
import { InventoryMovementDocument } from '@/infrastructure/persistence/schemas/inventory-movement.schema';
import { InventoryMovement } from '@/domain/inventory/entities/inventory-movement.entity';
import { InventoryMovementId } from '@/domain/inventory/value-objects/inventory-movement-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { InventoryItemId } from '@/domain/inventory/value-objects/inventory-item-id.vo';
import { InventoryMovementType } from '@/domain/inventory/value-objects/inventory-movement-type.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

@Injectable()
export class MongoInventoryMovementRepository implements InventoryMovementRepository {
  constructor(
    @InjectModel(InventoryMovementDocument.name)
    private readonly inventoryMovementModel: Model<InventoryMovementDocument>,
  ) {}

  async save(
    movement: InventoryMovement,
    transactionContext?: TransactionContextData,
  ): Promise<string> {
    const id = movement.getId()?.toString();
    const session = transactionContext as ClientSession | undefined;

    const document = {
      tenantId: new Types.ObjectId(movement.getTenantId().toString()),
      propertyId: new Types.ObjectId(movement.getPropertyId().toString()),
      itemId: new Types.ObjectId(movement.getItemId().toString()),
      type: movement.getType(),
      quantity: movement.getQuantity(),
      reason: movement.getReason(),
      reference: movement.getReference(),
      actorId: movement.getActorId(),
      actorEmail: movement.getActorEmail(),
    };

    if (id) {
      await this.inventoryMovementModel.findByIdAndUpdate(id, document, {
        new: true,
        session,
      });
      return id;
    }

    const [created] = await this.inventoryMovementModel.create([document], {
      session,
    });

    return created._id.toString();
  }

  async findByPropertyId(
    tenantId: TenantId,
    propertyId: PropertyId,
    page: number,
    limit: number,
  ): Promise<InventoryMovement[]> {
    const skip = (page - 1) * limit;

    const documents = await this.inventoryMovementModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        propertyId: new Types.ObjectId(propertyId.toString()),
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return documents.map((document) => this.toDomain(document));
  }

  async findByItemId(
    tenantId: TenantId,
    itemId: InventoryItemId,
    page: number,
    limit: number,
  ): Promise<InventoryMovement[]> {
    const skip = (page - 1) * limit;

    const documents = await this.inventoryMovementModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        itemId: new Types.ObjectId(itemId.toString()),
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return documents.map((document) => this.toDomain(document));
  }

  private toDomain(document: InventoryMovementDocument): InventoryMovement {
    return InventoryMovement.reconstitute({
      id: InventoryMovementId.create(document._id.toString()),
      tenantId: TenantId.createFromString(document.tenantId.toString()),
      propertyId: PropertyId.create(document.propertyId.toString()),
      itemId: InventoryItemId.create(document.itemId.toString()),
      type: document.type as InventoryMovementType,
      quantity: document.quantity,
      reason: document.reason,
      reference: document.reference,
      actorId: document.actorId,
      actorEmail: document.actorEmail,
      createdAt: document.createdAt,
    });
  }
}
