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
    const reservationItem = cart.getReservationItem();
    const doc = {
      guestAccountId: new Types.ObjectId(cart.getGuestAccountId().toString()),
      status: cart.getStatus().toString(),
      experienceItems: cart.getExperienceItems().map((item) => ({
        tenantId: new Types.ObjectId(item.tenantId),
        experienceId: new Types.ObjectId(item.experienceId.toString()),
        experienceName: item.experienceName,
        selectedDate: item.selectedDate ?? null,
        quantity: item.quantity,
        unitPriceCopSnapshot: item.unitPriceCopSnapshot,
        reservationId: item.reservationId
          ? new Types.ObjectId(item.reservationId)
          : null,
      })),
      reservationItem: reservationItem
        ? {
            tenantId: new Types.ObjectId(reservationItem.tenantId),
            propertyId: new Types.ObjectId(reservationItem.propertyId),
            unitId: new Types.ObjectId(reservationItem.unitId),
            checkIn: reservationItem.checkIn,
            checkOut: reservationItem.checkOut,
            guestsCount: reservationItem.guestsCount,
            notes: reservationItem.notes,
            pricePerNight: reservationItem.pricePerNight,
            totalPriceCopSnapshot: reservationItem.totalPriceCopSnapshot,
            reservationId: reservationItem.reservationId
              ? new Types.ObjectId(reservationItem.reservationId)
              : null,
          }
        : null,
    };

    if (id) {
      await this.cartModel.findByIdAndUpdate(id, doc);
      return id;
    }

    const existing = await this.cartModel.findOne({
      guestAccountId: new Types.ObjectId(cart.getGuestAccountId().toString()),
    });

    if (existing) {
      await this.cartModel.findByIdAndUpdate(existing._id, doc);
      return existing._id.toString();
    }

    const created = await this.cartModel.create(doc);
    return created._id.toString();
  }

  async findById(id: CartId): Promise<Cart | null> {
    const doc = await this.cartModel.findById(id.toString());
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findOpenByGuest(guestAccountId: GuestAccountId): Promise<Cart | null> {
    const doc = await this.cartModel.findOne({
      guestAccountId: new Types.ObjectId(guestAccountId.toString()),
      status: CartStatusEnum.OPEN,
    });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByGuestAccountId(
    guestAccountId: GuestAccountId,
  ): Promise<Cart | null> {
    const doc = await this.cartModel
      .findOne({
        guestAccountId: new Types.ObjectId(guestAccountId.toString()),
      })
      .sort({ createdAt: -1 });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findPendingPaymentCartsOlderThan(date: Date): Promise<Cart[]> {
    const docs = await this.cartModel.find({
      status: CartStatusEnum.PENDING_PAYMENT,
      updatedAt: { $lt: date },
    });
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  private toDomainEntity(doc: CartDocument): Cart {
    return Cart.reconstitute({
      id: CartId.createFromString(doc._id.toString()),
      guestAccountId: GuestAccountId.createFromString(
        doc.guestAccountId.toString(),
      ),
      experienceItems: doc.experienceItems.map((item) =>
        CartItem.create({
          tenantId: item.tenantId.toString(),
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
            tenantId: doc.reservationItem.tenantId.toString(),
            propertyId: doc.reservationItem.propertyId.toString(),
            unitId: doc.reservationItem.unitId.toString(),
            checkIn: doc.reservationItem.checkIn,
            checkOut: doc.reservationItem.checkOut,
            guestsCount: doc.reservationItem.guestsCount,
            notes: doc.reservationItem.notes,
            pricePerNight: doc.reservationItem.pricePerNight,
            totalPriceCopSnapshot: doc.reservationItem.totalPriceCopSnapshot,
            reservationId: doc.reservationItem.reservationId?.toString() ?? null,
          })
        : null,
      status: CartStatus.create(doc.status as CartStatusEnum),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
