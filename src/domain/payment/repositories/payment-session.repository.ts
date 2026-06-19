import { CartId } from '@/domain/cart/value-objects/cart-id.vo';

export const PAYMENT_SESSION_REPOSITORY = 'PAYMENT_SESSION_REPOSITORY';

export interface PaymentSession {
  id: string;
  cartId: string;
  reference: string;
  amountInCents: number;
  status: string;
}

export interface PaymentSessionRepository {
  findPendingByCartId(cartId: CartId): Promise<PaymentSession | null>;
}
