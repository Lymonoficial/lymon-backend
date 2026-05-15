import { NotFoundException } from '@nestjs/common';
import { CheckoutCartHandler } from '@/application/cart/commands/checkout-cart/checkout-cart.handler';
import { CheckoutCartCommand } from '@/application/cart/commands/checkout-cart/checkout-cart.command';
import { DomainException } from '@/domain/shared/exceptions/domain.exception';
import { createCartRepositoryMock } from '@test/shared/mocks/repositories/cart-repository.mock';
import { createReservationRepositoryMock } from '@test/shared/mocks/repositories/reservation-repository.mock';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';
import { createExperienceRepositoryMock } from '@test/shared/mocks/repositories/experience-repository.mock';
import { createExperiencePurchaseRepositoryMock } from '@test/shared/mocks/repositories/experience-purchase-repository.mock';
import { PAYMENT_SESSION_REPOSITORY } from '@/domain/payment/repositories/payment-session.repository';
import { createEventEmitterMock } from '@test/shared/mocks/services/event-emitter.mock';
import { makeCart, makeCartItem } from '@test/shared/fixtures/cart.fixture';
import { makeReservation } from '@test/shared/fixtures/reservation.fixture';
import { makeGuest } from '@test/shared/fixtures/guest.fixture';
import { makeExperience } from '@test/shared/fixtures/experience.fixture';
import { CartReservationItem } from '@/domain/cart/value-objects/cart-reservation-item.vo';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';
import { CartStatusEnum } from '@/domain/cart/value-objects/cart-status.vo';
import {
  type IPaymentGateway,
  type PaymentCheckoutResponse,
} from '@/domain/shared/payment-gateway.interface';

const GUEST_ACCOUNT_ID = '65f1a1a2b3c4d5e6f7a8b9c0';
const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c2';
const RESERVATION_ID = '65f1a1a2b3c4d5e6f7a8b9c1';
const GUEST_ID = '65f1a1a2b3c4d5e6f7a8b9c5';

const command = new CheckoutCartCommand(
  GUEST_ACCOUNT_ID,
  TENANT_ID,
  'guest@example.com',
);

const paymentResponse: PaymentCheckoutResponse = {
  publicKey: 'pub_test_123',
  reference: 'checkout_65f1a1a2b3c4d5e6f7a8bb01_test',
  amountInCents: 90000,
  currency: 'COP',
  signatureIntegrity: 'signature-hash',
  redirectUrl: 'https://example.com/checkout',
  expirationTime: null,
  customerData: {
    email: 'guest@example.com',
  },
};

describe('CheckoutCartHandler', () => {
  let handler: CheckoutCartHandler;
  let cartRepository: ReturnType<typeof createCartRepositoryMock>;
  let reservationRepository: ReturnType<typeof createReservationRepositoryMock>;
  let guestRepository: ReturnType<typeof createGuestRepositoryMock>;
  let experienceRepository: ReturnType<typeof createExperienceRepositoryMock>;
  let purchaseRepository: ReturnType<
    typeof createExperiencePurchaseRepositoryMock
  >;
  let paymentSessionRepository: {
    save: jest.Mock;
    findByReference: jest.Mock;
    findByProviderReference: jest.Mock;
    findPendingByCartId: jest.Mock;
  };
  let eventEmitter: ReturnType<typeof createEventEmitterMock>;
  let paymentGateway: jest.Mocked<IPaymentGateway>;

  beforeEach(() => {
    cartRepository = createCartRepositoryMock();
    reservationRepository = createReservationRepositoryMock();
    guestRepository = createGuestRepositoryMock();
    experienceRepository = createExperienceRepositoryMock();
    purchaseRepository = createExperiencePurchaseRepositoryMock();
    paymentSessionRepository = {
      save: jest.fn(),
      findByReference: jest.fn(),
      findByProviderReference: jest.fn(),
      findPendingByCartId: jest.fn().mockResolvedValue(null),
    };
    eventEmitter = createEventEmitterMock();
    paymentGateway = {
      buildCheckoutPayload: jest.fn().mockResolvedValue(paymentResponse),
    } as unknown as jest.Mocked<IPaymentGateway>;

    handler = new CheckoutCartHandler(
      cartRepository,
      reservationRepository,
      guestRepository,
      experienceRepository,
      purchaseRepository,
      paymentSessionRepository as never,
      paymentGateway,
      eventEmitter as never,
    );
  });

  it('throws NotFoundException when no open cart exists', async () => {
    cartRepository.findOpenByGuest.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('throws DomainException when cart is empty', async () => {
    cartRepository.findOpenByGuest.mockResolvedValue(makeCart());

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('creates Wompi payload for cart with only experience items', async () => {
    const cartItem = makeCartItem({ quantity: 2 });
    const cart = makeCart({ experienceItems: [cartItem] });
    cartRepository.findOpenByGuest.mockResolvedValue(cart);

    experienceRepository.findById.mockResolvedValue(makeExperience());
    purchaseRepository.countConfirmedByExperienceAndDate.mockResolvedValue(0);
    cartRepository.save.mockResolvedValue(cart.getId()!.toString());

    const result = await handler.execute(command);

    expect(paymentGateway.buildCheckoutPayload).toHaveBeenCalledTimes(1);
    expect(cartRepository.save).toHaveBeenCalledTimes(1);
    expect(cartRepository.save.mock.calls[0][0].getStatus().getValue()).toBe(
      CartStatusEnum.CHECKED_OUT,
    );
    expect(result).toEqual(paymentResponse);
    expect(reservationRepository.save).not.toHaveBeenCalled();
    expect(purchaseRepository.save).not.toHaveBeenCalled();
  });

  it('creates Wompi payload for cart with reservation and experiences', async () => {
    const reservationItem = CartReservationItem.create({
      tenantId: TENANT_ID,
      reservationId: RESERVATION_ID,
      totalPriceCopSnapshot: 400000,
    });
    const cartItem = makeCartItem();
    const cart = makeCart({
      experienceItems: [cartItem],
      reservationItem,
    });
    cartRepository.findOpenByGuest.mockResolvedValue(cart);

    const guest = makeGuest({
      id: GUEST_ID,
      primaryEmail: 'guest@example.com',
      fullName: 'Guest Example',
    });
    guestRepository.findByGuestAccountId.mockResolvedValue(guest);

    const reservation = makeReservation({
      id: RESERVATION_ID,
      guestId: GUEST_ID,
      status: ReservationStatusEnum.PENDING,
    });
    reservationRepository.findById.mockResolvedValue(reservation);
    reservationRepository.findByGuestId.mockResolvedValue([]);

    experienceRepository.findById.mockResolvedValue(makeExperience());
    purchaseRepository.countConfirmedByExperienceAndDate.mockResolvedValue(0);
    cartRepository.save.mockResolvedValue(cart.getId()!.toString());

    const result = await handler.execute(command);

    expect(paymentGateway.buildCheckoutPayload).toHaveBeenCalledTimes(1);
    expect(result).toEqual(paymentResponse);
    expect(reservationRepository.save).not.toHaveBeenCalled();
    expect(purchaseRepository.save).not.toHaveBeenCalled();
  });

  it('throws DomainException when experience capacity exceeded', async () => {
    const experience = makeExperience();
    const cartItem = makeCartItem({ quantity: 10 });
    const cart = makeCart({ experienceItems: [cartItem] });
    cartRepository.findOpenByGuest.mockResolvedValue(cart);

    experienceRepository.findById.mockResolvedValue(experience);
    purchaseRepository.countConfirmedByExperienceAndDate.mockResolvedValue(
      experience.getCapacity(),
    );

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('throws DomainException when reservation in cart is not PENDING', async () => {
    const reservationItem = CartReservationItem.create({
      tenantId: TENANT_ID,
      reservationId: RESERVATION_ID,
      totalPriceCopSnapshot: 400000,
    });
    const cart = makeCart({ reservationItem, experienceItems: [] });
    cartRepository.findOpenByGuest.mockResolvedValue(cart);

    const guest = makeGuest({ id: GUEST_ID });
    guestRepository.findByGuestAccountId.mockResolvedValue(guest);

    const confirmedReservation = makeReservation({
      id: RESERVATION_ID,
      guestId: GUEST_ID,
      status: ReservationStatusEnum.CONFIRMED,
    });
    reservationRepository.findById.mockResolvedValue(confirmedReservation);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('throws DomainException when overlapping reservation exists at same property', async () => {
    const reservationItem = CartReservationItem.create({
      tenantId: TENANT_ID,
      reservationId: RESERVATION_ID,
      totalPriceCopSnapshot: 400000,
    });
    const cart = makeCart({ reservationItem, experienceItems: [] });
    cartRepository.findOpenByGuest.mockResolvedValue(cart);

    const guest = makeGuest({ id: GUEST_ID });
    guestRepository.findByGuestAccountId.mockResolvedValue(guest);

    const targetReservation = makeReservation({
      id: RESERVATION_ID,
      guestId: GUEST_ID,
      status: ReservationStatusEnum.PENDING,
    });
    const conflictingReservation = makeReservation({
      id: '65f1a1a2b3c4d5e6f7a8b9cf',
      guestId: GUEST_ID,
      status: ReservationStatusEnum.CONFIRMED,
    });
    reservationRepository.findById.mockResolvedValue(targetReservation);
    reservationRepository.findByGuestId.mockResolvedValue([
      conflictingReservation,
    ]);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });
});
