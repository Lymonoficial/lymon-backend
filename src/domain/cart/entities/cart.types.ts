import { CartId } from '@/domain/cart/value-objects/cart-id.vo';
import { CartItem } from '@/domain/cart/value-objects/cart-item.vo';
import { CartReservationItem } from '@/domain/cart/value-objects/cart-reservation-item.vo';
import { CartStatus } from '@/domain/cart/value-objects/cart-status.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export interface CartCreateParams {
  tenantId: TenantId;
  guestAccountId: GuestAccountId;
}

export interface ICartData {
  id: CartId;
  tenantId: TenantId;
  guestAccountId: GuestAccountId;
  experienceItems: CartItem[];
  reservationItem: CartReservationItem | null;
  status: CartStatus;
  createdAt: Date;
  updatedAt: Date;
}
