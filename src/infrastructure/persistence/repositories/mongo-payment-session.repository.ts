import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { CartId } from '@/domain/cart/value-objects/cart-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { PaymentSession } from '@/domain/payment/entities/payment-session.entity';
import { PaymentSessionStatusEnum } from '@/domain/payment/value-objects/payment-session-status.vo';
import { PaymentSessionRepository } from '@/domain/payment/repositories/payment-session.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PaymentSessionDocument } from '../schemas/payment-session.schema';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

@Injectable()
export class MongoPaymentSessionRepository implements PaymentSessionRepository {
  constructor(
    @InjectModel(PaymentSessionDocument.name)
    private readonly paymentSessionModel: Model<PaymentSessionDocument>,
  ) {}

  async save(
    session: PaymentSession,
    ctx?: TransactionContextData,
  ): Promise<string> {
    const id = session.getId()?.toString();
    const doc = {
      tenantId: new Types.ObjectId(session.getTenantId().toString()),
      guestAccountId: new Types.ObjectId(
        session.getGuestAccountId().toString(),
      ),
      cartId: new Types.ObjectId(session.getCartId().toString()),
      reference: session.getReference(),
      amountInCents: session.getAmountInCents(),
      currency: session.getCurrency(),
      publicKey: session.getPublicKey(),
      signatureIntegrity: session.getSignatureIntegrity(),
      redirectUrl: session.getRedirectUrl(),
      expirationTime: session.getExpirationTime(),
      providerReference: session.getProviderReference(),
      status: session.getStatus().toString(),
      updatedAt: session.getUpdatedAt(),
    };

    const options = ctx ? { session: ctx as ClientSession } : undefined;

    if (id) {
      await this.paymentSessionModel.findByIdAndUpdate(id, doc, options);
      return id;
    }

    const created = await this.paymentSessionModel.create(
      [
        {
          ...doc,
          createdAt: session.getCreatedAt(),
        },
      ],
      options,
    );

    return created[0]._id.toString();
  }

  async findByReference(reference: string): Promise<PaymentSession | null> {
    const doc = await this.paymentSessionModel.findOne({ reference });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByProviderReference(
    providerReference: string,
  ): Promise<PaymentSession | null> {
    const doc = await this.paymentSessionModel.findOne({ providerReference });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findPendingByCartId(cartId: CartId): Promise<PaymentSession | null> {
    const doc = await this.paymentSessionModel.findOne({
      cartId: new Types.ObjectId(cartId.toString()),
      status: PaymentSessionStatusEnum.PENDING,
    });

    return doc ? this.toDomainEntity(doc) : null;
  }

  private toDomainEntity(doc: PaymentSessionDocument): PaymentSession {
    return PaymentSession.reconstitute({
      id: doc._id.toString(),
      tenantId: TenantId.createFromString(doc.tenantId.toString()),
      guestAccountId: GuestAccountId.createFromString(
        doc.guestAccountId.toString(),
      ),
      cartId: CartId.createFromString(doc.cartId.toString()),
      reference: doc.reference,
      amountInCents: doc.amountInCents,
      currency: doc.currency as 'COP',
      publicKey: doc.publicKey,
      signatureIntegrity: doc.signatureIntegrity,
      redirectUrl: doc.redirectUrl,
      expirationTime: doc.expirationTime,
      providerReference: doc.providerReference,
      status: doc.status as PaymentSessionStatusEnum,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
