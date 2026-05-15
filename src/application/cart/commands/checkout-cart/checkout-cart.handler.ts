import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomUUID } from 'node:crypto';
import { CheckoutCartCommand } from './checkout-cart.command';
import {
  CART_REPOSITORY,
  type CartRepository,
} from '@/domain/cart/repositories/cart.repository';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import {
  EXPERIENCE_REPOSITORY,
  type ExperienceRepository,
} from '@/domain/experience/repositories/experience.repository';
import {
  EXPERIENCE_PURCHASE_REPOSITORY,
  type ExperiencePurchaseRepository,
} from '@/domain/experience-purchase/repositories/experience-purchase.repository';
import {
  PAYMENT_SESSION_REPOSITORY,
  type PaymentSessionRepository,
} from '@/domain/payment/repositories/payment-session.repository';
import { ExperienceCapacityChecker } from '@/domain/experience-purchase/services/experience-capacity-checker.domain-service';
import { GuestReservationOverlapChecker } from '@/domain/reservation/services/guest-reservation-overlap-checker.domain-service';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';
import { ExperienceStatusEnum } from '@/domain/experience/value-objects/experience-status.vo';
import { CartItem } from '@/domain/cart/value-objects/cart-item.vo';
import { CartReservationItem } from '@/domain/cart/value-objects/cart-reservation-item.vo';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { DomainException } from '@/domain/shared/exceptions/domain.exception';
import { PaymentSession } from '@/domain/payment/entities/payment-session.entity';
import {
  PAYMENT_GATEWAY,
  type IPaymentGateway,
  type PaymentCheckoutResponse,
} from '@/domain/shared/payment-gateway.interface';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';

@CommandHandler(CheckoutCartCommand)
export class CheckoutCartHandler implements ICommandHandler<CheckoutCartCommand> {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepository: ExperienceRepository,
    @Inject(EXPERIENCE_PURCHASE_REPOSITORY)
    private readonly experiencePurchaseRepository: ExperiencePurchaseRepository,
    @Inject(PAYMENT_SESSION_REPOSITORY)
    private readonly paymentSessionRepository: PaymentSessionRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: IPaymentGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: CheckoutCartCommand,
  ): Promise<PaymentCheckoutResponse> {
    const guestAccountId = GuestAccountId.createFromString(
      command.guestAccountId,
    );

    const cart = await this.cartRepository.findOpenByGuest(guestAccountId);
    if (!cart) {
      throw new NotFoundException('No open cart found');
    }
    if (cart.getExperienceItems().length === 0 && !cart.getReservationItem()) {
      throw new DomainException('Cannot checkout an empty cart');
    }

    const tenantId = this.resolveTenantId(cart);
    const guest = await this.validateCheckoutItems(cart, command);

    const existingSession =
      await this.paymentSessionRepository.findPendingByCartId(cart.getId()!);

    if (existingSession) {
      if (cart.getStatus().isOpen()) {
        cart.checkout();
        await this.cartRepository.save(cart);
      }

      return this.toCheckoutResponse(
        existingSession,
        guest,
        command.actorEmail,
      );
    }

    const reference = this.buildPaymentReference(cart.getId()!.toString());

    const checkoutPayload = await this.paymentGateway.buildCheckoutPayload({
      reference,
      amountInCents: cart.getTotalCop(),
      currency: 'COP',
      customerData: {
        email: guest?.getPrimaryEmail() ?? command.actorEmail,
        fullName: guest?.getFullName() ?? null,
      },
    });

    const paymentSession = PaymentSession.create({
      tenantId,
      guestAccountId,
      cartId: cart.getId()!,
      reference: checkoutPayload.reference,
      amountInCents: checkoutPayload.amountInCents,
      currency: checkoutPayload.currency,
      publicKey: checkoutPayload.publicKey,
      signatureIntegrity: checkoutPayload.signatureIntegrity,
      redirectUrl: checkoutPayload.redirectUrl ?? null,
      expirationTime: checkoutPayload.expirationTime ?? null,
    });

    await this.paymentSessionRepository.save(paymentSession);

    cart.checkout();
    await this.cartRepository.save(cart);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        tenantId.toString(),
        command.actorId,
        command.actorEmail,
        AuditAction.CART_CHECKED_OUT,
        AuditEntityType.CART,
        cart.getId()!.toString(),
        {
          reference: checkoutPayload.reference,
          amountInCents: checkoutPayload.amountInCents,
          currency: checkoutPayload.currency,
        },
      ),
    );

    return checkoutPayload;
  }

  private toCheckoutResponse(
    paymentSession: PaymentSession,
    guest: Guest | null,
    fallbackEmail: string,
  ): PaymentCheckoutResponse {
    return {
      publicKey: paymentSession.getPublicKey(),
      reference: paymentSession.getReference(),
      amountInCents: paymentSession.getAmountInCents(),
      currency: paymentSession.getCurrency(),
      signatureIntegrity: paymentSession.getSignatureIntegrity(),
      redirectUrl: paymentSession.getRedirectUrl(),
      expirationTime: paymentSession.getExpirationTime(),
      customerData: {
        email: guest?.getPrimaryEmail() ?? fallbackEmail,
        fullName: guest?.getFullName() ?? null,
      },
    };
  }

  private async validateCheckoutItems(
    cart: {
      getReservationItem(): CartReservationItem | null;
      getExperienceItems(): CartItem[];
    },
    command: CheckoutCartCommand,
  ) {
    const reservationItem = cart.getReservationItem();
    let guest: Guest | null = null;

    if (reservationItem) {
      guest = await this.validateReservationItem(reservationItem, command);
    }

    for (const item of cart.getExperienceItems()) {
      await this.validateExperienceItem(item);
    }

    return guest;
  }

  private async validateReservationItem(
    reservationItem: CartReservationItem,
    command: CheckoutCartCommand,
  ): Promise<Guest> {
    const guestAccountId = GuestAccountId.createFromString(
      command.guestAccountId,
    );
    const guest = await this.guestRepository.findByGuestAccountId(
      TenantId.createFromString(reservationItem.tenantId),
      guestAccountId,
    );
    if (!guest) {
      throw new NotFoundException('Guest profile not found for this tenant');
    }

    const reservation = await this.reservationRepository.findById(
      ReservationId.create(reservationItem.reservationId),
    );
    if (!reservation) {
      throw new NotFoundException('Reservation in cart no longer exists');
    }
    if (reservation.getGuestId().toString() !== guest.getId()!.toString()) {
      throw new DomainException(
        'Reservation in cart does not belong to this guest',
      );
    }
    if (reservation.getStatus().getValue() !== ReservationStatusEnum.PENDING) {
      throw new DomainException(
        'Reservation is no longer in PENDING status and cannot be paid',
      );
    }

    const guestReservations = await this.reservationRepository.findByGuestId(
      reservationItem.tenantId,
      guest.getId()!.toString(),
      1,
      200,
    );
    GuestReservationOverlapChecker.check(
      guestReservations,
      reservation.getPropertyId().toString(),
      reservation.getDateRange(),
      reservationItem.reservationId,
    );

    return guest;
  }

  private async validateExperienceItem(item: CartItem): Promise<void> {
    const experience = await this.experienceRepository.findById(
      ExperienceId.create(item.experienceId.toString()),
    );
    if (!experience) {
      throw new NotFoundException(
        `Experience ${item.experienceId.toString()} not found`,
      );
    }
    if (experience.getStatus().toString() !== ExperienceStatusEnum.ACTIVE) {
      throw new DomainException(
        `Experience '${experience.getName()}' is no longer active`,
      );
    }

    const hasReservation = !!item.reservationId;
    if (hasReservation && !experience.getAllowReservationPurchase()) {
      throw new DomainException(
        `Experience '${experience.getName()}' cannot be purchased as a reservation add-on`,
      );
    }
    if (!hasReservation && !experience.getAllowStandalonePurchase()) {
      throw new DomainException(
        `Experience '${experience.getName()}' cannot be purchased standalone`,
      );
    }

    const confirmedCount =
      await this.experiencePurchaseRepository.countConfirmedByExperienceAndDate(
        item.experienceId.toString(),
        item.selectedDate,
      );
    ExperienceCapacityChecker.check(experience, item.quantity, confirmedCount);
  }

  private resolveTenantId(cart: {
    getReservationItem(): CartReservationItem | null;
    getExperienceItems(): CartItem[];
  }): TenantId {
    const reservationItem = cart.getReservationItem();
    if (reservationItem) {
      return TenantId.createFromString(reservationItem.tenantId);
    }

    const firstExperienceItem = cart.getExperienceItems()[0];
    if (!firstExperienceItem) {
      throw new DomainException('Cannot resolve tenant for empty checkout');
    }

    return TenantId.createFromString(firstExperienceItem.tenantId);
  }

  private buildPaymentReference(cartId: string): string {
    return `checkout_${cartId}_${randomUUID()}`;
  }
}
