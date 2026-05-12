import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetGuestCartQuery } from './get-guest-cart.query';
import {
  CART_REPOSITORY,
  type CartRepository,
} from '@/domain/cart/repositories/cart.repository';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export interface CartItemResult {
  experienceId: string;
  experienceName: string;
  selectedDate: Date | null;
  quantity: number;
  unitPriceCop: number;
  totalPriceCop: number;
  reservationId: string | null;
}

export interface GuestCartResult {
  cartId: string | null;
  status: string;
  experienceItems: CartItemResult[];
  reservationItem: {
    reservationId: string;
    totalPriceCop: number;
  } | null;
  totalCop: number;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetGuestCartQuery)
export class GetGuestCartHandler implements IQueryHandler<GetGuestCartQuery> {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(query: GetGuestCartQuery): Promise<GuestCartResult | null> {
    const cart = await this.cartRepository.findOpenByGuestAndTenant(
      GuestAccountId.createFromString(query.guestAccountId),
      TenantId.createFromString(query.tenantId),
    );
    if (!cart) return null;

    return {
      cartId: cart.getId()?.toString() ?? null,
      status: cart.getStatus().toString(),
      experienceItems: cart.getExperienceItems().map((item) => ({
        experienceId: item.experienceId.toString(),
        experienceName: item.experienceName,
        selectedDate: item.selectedDate,
        quantity: item.quantity,
        unitPriceCop: item.unitPriceCopSnapshot,
        totalPriceCop: item.getTotalCop(),
        reservationId: item.reservationId,
      })),
      reservationItem: cart.getReservationItem()
        ? {
            reservationId: cart.getReservationItem()!.reservationId,
            totalPriceCop: cart.getReservationItem()!.totalPriceCopSnapshot,
          }
        : null,
      totalCop: cart.getTotalCop(),
      createdAt: cart.getCreatedAt(),
      updatedAt: cart.getUpdatedAt(),
    };
  }
}
