import { NotFoundException } from '@nestjs/common';
import { SetCartReservationHandler } from '@/application/cart/commands/set-cart-reservation/set-cart-reservation.handler';
import { SetCartReservationCommand } from '@/application/cart/commands/set-cart-reservation/set-cart-reservation.command';
import { DomainException } from '@/domain/shared/exceptions/domain.exception';
import { createCartRepositoryMock } from '@test/shared/mocks/repositories/cart-repository.mock';
import { createReservationRepositoryMock } from '@test/shared/mocks/repositories/reservation-repository.mock';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';
import { makeCart } from '@test/shared/fixtures/cart.fixture';
import { makeReservation } from '@test/shared/fixtures/reservation.fixture';
import { makeGuest } from '@test/shared/fixtures/guest.fixture';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';

const GUEST_ACCOUNT_ID = '65f1a1a2b3c4d5e6f7a8b9c0';
const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c2';
const RESERVATION_ID = '65f1a1a2b3c4d5e6f7a8b9c1';
const GUEST_ID = '65f1a1a2b3c4d5e6f7a8b9c5';

const command = new SetCartReservationCommand(
  GUEST_ACCOUNT_ID,
  TENANT_ID,
  RESERVATION_ID,
  'guest@example.com',
);

describe('SetCartReservationHandler', () => {
  let handler: SetCartReservationHandler;
  let cartRepository: ReturnType<typeof createCartRepositoryMock>;
  let reservationRepository: ReturnType<typeof createReservationRepositoryMock>;
  let guestRepository: ReturnType<typeof createGuestRepositoryMock>;

  beforeEach(() => {
    cartRepository = createCartRepositoryMock();
    reservationRepository = createReservationRepositoryMock();
    guestRepository = createGuestRepositoryMock();
    handler = new SetCartReservationHandler(
      cartRepository,
      reservationRepository,
      guestRepository,
    );
  });

  it('sets reservation on existing cart when valid', async () => {
    const guest = makeGuest({ id: GUEST_ID });
    guestRepository.findByGuestAccountId.mockResolvedValue(guest);

    const reservation = makeReservation({
      id: RESERVATION_ID,
      guestId: GUEST_ID,
      status: ReservationStatusEnum.PENDING,
    });
    reservationRepository.findById.mockResolvedValue(reservation);
    reservationRepository.findByGuestId.mockResolvedValue([]);

    const cart = makeCart();
    cartRepository.findOpenByGuestAndTenant.mockResolvedValue(cart);
    cartRepository.save.mockResolvedValue(cart.getId()!.toString());

    await handler.execute(command);

    expect(cartRepository.save).toHaveBeenCalledTimes(1);
    const savedCart = cartRepository.save.mock.calls[0][0];
    expect(savedCart.getReservationItem()?.reservationId).toBe(RESERVATION_ID);
  });

  it('creates new cart if none exists', async () => {
    const guest = makeGuest({ id: GUEST_ID });
    guestRepository.findByGuestAccountId.mockResolvedValue(guest);

    const reservation = makeReservation({
      id: RESERVATION_ID,
      guestId: GUEST_ID,
      status: ReservationStatusEnum.PENDING,
    });
    reservationRepository.findById.mockResolvedValue(reservation);
    reservationRepository.findByGuestId.mockResolvedValue([]);

    cartRepository.findOpenByGuestAndTenant.mockResolvedValue(null);
    cartRepository.save.mockResolvedValue('new-cart-id');

    await handler.execute(command);

    expect(cartRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws DomainException when reservation does not belong to guest', async () => {
    const guest = makeGuest({ id: GUEST_ID });
    guestRepository.findByGuestAccountId.mockResolvedValue(guest);

    const reservation = makeReservation({
      id: RESERVATION_ID,
      guestId: '65f1a1a2b3c4d5e6f7a8b900',
      status: ReservationStatusEnum.PENDING,
    });
    reservationRepository.findById.mockResolvedValue(reservation);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('throws DomainException when reservation is not PENDING', async () => {
    const guest = makeGuest({ id: GUEST_ID });
    guestRepository.findByGuestAccountId.mockResolvedValue(guest);

    const reservation = makeReservation({
      id: RESERVATION_ID,
      guestId: GUEST_ID,
      status: ReservationStatusEnum.CONFIRMED,
    });
    reservationRepository.findById.mockResolvedValue(reservation);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('throws DomainException when overlapping reservation exists at same property', async () => {
    const guest = makeGuest({ id: GUEST_ID });
    guestRepository.findByGuestAccountId.mockResolvedValue(guest);

    const targetReservation = makeReservation({
      id: RESERVATION_ID,
      guestId: GUEST_ID,
      status: ReservationStatusEnum.PENDING,
    });
    const conflicting = makeReservation({
      id: '65f1a1a2b3c4d5e6f7a8b9cf',
      guestId: GUEST_ID,
      status: ReservationStatusEnum.CONFIRMED,
    });
    reservationRepository.findById.mockResolvedValue(targetReservation);
    reservationRepository.findByGuestId.mockResolvedValue([conflicting]);

    await expect(handler.execute(command)).rejects.toThrow(DomainException);
  });

  it('throws NotFoundException when guest profile not found', async () => {
    guestRepository.findByGuestAccountId.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
