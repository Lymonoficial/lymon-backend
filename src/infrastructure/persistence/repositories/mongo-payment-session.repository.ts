import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type {
  PaymentSession,
  PaymentSessionRepository,
} from '@/domain/payment/repositories/payment-session.repository';
import { CartId } from '@/domain/cart/value-objects/cart-id.vo';
import { PaymentSessionDocument } from '@/infrastructure/persistence/schemas/payment-session.schema';

@Injectable()
export class MongoPaymentSessionRepository implements PaymentSessionRepository {
  constructor(
    @InjectModel(PaymentSessionDocument.name)
    private readonly model: Model<PaymentSessionDocument>,
  ) {}

  async findPendingByCartId(cartId: CartId): Promise<PaymentSession | null> {
    const doc = await this.model.findOne({
      cartId: new Types.ObjectId(cartId.toString()),
      status: 'PENDING',
    });

    if (!doc) return null;

    return {
      id: doc._id.toString(),
      cartId: doc.cartId.toString(),
      reference: doc.reference,
      amountInCents: doc.amountInCents,
      status: doc.status,
    };
  }
}
