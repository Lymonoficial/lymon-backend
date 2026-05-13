import { Cart } from '@/domain/cart/entities/cart.entity';
import { CartId } from '@/domain/cart/value-objects/cart-id.vo';
import { CartItem } from '@/domain/cart/value-objects/cart-item.vo';
import { CartReservationItem } from '@/domain/cart/value-objects/cart-reservation-item.vo';
import { CartStatus, CartStatusEnum } from '@/domain/cart/value-objects/cart-status.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';

export const CART_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8bb01',
  tenantId: '65f1a1a2b3c4d5e6f7a8b9c2',
  guestAccountId: '65f1a1a2b3c4d5e6f7a8b9c0',
  status: CartStatusEnum.OPEN,
  createdAt: new Date('2030-01-01T10:00:00Z'),
  updatedAt: new Date('2030-01-01T10:00:00Z'),
};

export function makeCart(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    guestAccountId: string;
    status: CartStatusEnum;
    experienceItems: CartItem[];
    reservationItem: CartReservationItem | null;
    createdAt: Date;
    updatedAt: Date;
  }>,
): Cart {
  const merged = { ...CART_FIXTURE_DEFAULTS, ...overrides };
  return Cart.reconstitute({
    id: CartId.createFromString(merged.id),
    tenantId: TenantId.createFromString(merged.tenantId),
    guestAccountId: GuestAccountId.createFromString(merged.guestAccountId),
    experienceItems: merged.experienceItems ?? [],
    reservationItem: merged.reservationItem ?? null,
    status: CartStatus.create(merged.status),
    createdAt: merged.createdAt,
    updatedAt: merged.updatedAt,
  });
}

export function makeCartItem(
  overrides?: Partial<{
    experienceId: string;
    experienceName: string;
    selectedDate: Date | null;
    quantity: number;
    unitPriceCopSnapshot: number;
    reservationId: string | null;
  }>,
): CartItem {
  return CartItem.create({
    experienceId: ExperienceId.create(
      overrides?.experienceId ?? '65f1a1a2b3c4d5e6f7a8bb10',
    ),
    experienceName: overrides?.experienceName ?? 'Test Experience',
    selectedDate: overrides?.selectedDate ?? null,
    quantity: overrides?.quantity ?? 1,
    unitPriceCopSnapshot: overrides?.unitPriceCopSnapshot ?? 50000,
    reservationId: overrides?.reservationId ?? null,
  });
}
