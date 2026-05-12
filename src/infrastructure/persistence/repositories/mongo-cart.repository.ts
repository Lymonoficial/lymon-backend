import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { CartRepository } from '@/domain/cart/repositories/cart.repository';
import { Cart } from '@/domain/cart/entities/cart.entity';
import { CartId } from '@/domain/cart/value-objects/cart-id.vo';
import { CartItem } from '@/domain/cart/value-objects/cart-item.vo';
import { CartReservationItem } from '@/domain/cart/value-objects/cart-reservation-item.vo';
import { CartStatus, CartStatusEnum } from '@/domain/cart/value-objects/cart-status.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { CartDocument } from '../schemas/cart.schema';

@Injectable()
export class MongoCartRepository implements CartRepository {
  constructor(
    @InjectModel(CartDocument.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async save(cart: Cart): Promise<string> {
    const id = cart.getId()?.toString();
    const doc = {
      tenantId: new Types.ObjectId(cart.getTenantId().toString()),
      guestAccountId: new Types.ObjectId(cart.getGuestAccountId().toString()),
      status: cart.getStatus().toString(),
      experienceItems: cart.getExperienceItems().map((item) => ({
        experienceId: new Types.ObjectId(item.experienceId.toString()),
        experienceName: item.experienceName,
        selectedDate: item.selectedDate ?? null,
        quantity: item.quantity,
        unitPriceCopSnapshot: item.unitPriceCopSnapshot,
        reservationId: item.reservationId
          ? new Types.ObjectId(item.reservationId)
          : null,
      })),
      reservationItem: cart.getReservationItem()
        ? {
            reservationId: new Types.ObjectId(
              cart.getReservationItem()!.reservationId,
            ),
            totalPriceCopSnapshot:
              cart.getReservationItem()!.totalPriceCopSnapshot,
          }
        : null,
    };

    if (id) {
      await this.cartModel.findByIdAndUpdate(id, doc);
      return id;
    }
    const created = await this.cartModel.create(doc);
    return created._id.toString();
  }

  async findById(id: CartId): Promise<Cart | null> {
    const doc = await this.cartModel.findById(id.toString());
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findOpenByGuestAndTenant(
    guestAccountId: GuestAccountId,
    tenantId: TenantId,
  ): Promise<Cart | null> {
    const doc = await this.cartModel.findOne({
      guestAccountId: new Types.ObjectId(guestAccountId.toString()),
      tenantId: new Types.ObjectId(tenantId.toString()),
      status: CartStatusEnum.OPEN,
    });
    return doc ? this.toDomainEntity(doc) : null;
  }

  private toDomainEntity(doc: CartDocument): Cart {
    return Cart.reconstitute({
      id: CartId.createFromString(doc._id.toString()),
      tenantId: TenantId.createFromString(doc.tenantId.toString()),
      guestAccountId: GuestAccountId.createFromString(
        doc.guestAccountId.toString(),
      ),
      experienceItems: doc.experienceItems.map((item) =>
        CartItem.create({
          experienceId: ExperienceId.create(item.experienceId.toString()),
          experienceName: item.experienceName,
          selectedDate: item.selectedDate ?? null,
          quantity: item.quantity,
          unitPriceCopSnapshot: item.unitPriceCopSnapshot,
          reservationId: item.reservationId?.toString() ?? null,
        }),
      ),
      reservationItem: doc.reservationItem
        ? CartReservationItem.create({
            reservationId: doc.reservationItem.reservationId.toString(),
            totalPriceCopSnapshot:
              doc.reservationItem.totalPriceCopSnapshot,
          })
        : null,
      status: CartStatus.create(doc.status as CartStatusEnum),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
