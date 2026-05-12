import { Cart } from '@/domain/cart/entities/cart.entity';
import { CartId } from '@/domain/cart/value-objects/cart-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export const CART_REPOSITORY = 'CART_REPOSITORY';

export interface CartRepository {
  save(cart: Cart): Promise<string>;
  findById(id: CartId): Promise<Cart | null>;
  findOpenByGuestAndTenant(
    guestAccountId: GuestAccountId,
    tenantId: TenantId,
  ): Promise<Cart | null>;
}
