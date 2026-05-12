import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetCartReservationCommand } from './set-cart-reservation.command';
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
import { Cart } from '@/domain/cart/entities/cart.entity';
import { CartReservationItem } from '@/domain/cart/value-objects/cart-reservation-item.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';
import { GuestReservationOverlapChecker } from '@/domain/reservation/services/guest-reservation-overlap-checker.domain-service';
import { DomainException } from '@/domain/shared/exceptions/domain.exception';

@CommandHandler(SetCartReservationCommand)
export class SetCartReservationHandler implements ICommandHandler<SetCartReservationCommand> {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(command: SetCartReservationCommand): Promise<void> {
    const guestAccountId = GuestAccountId.createFromString(
      command.guestAccountId,
    );
    const tenantId = TenantId.createFromString(command.tenantId);

    const guest = await this.guestRepository.findByGuestAccountId(
      tenantId,
      guestAccountId,
    );
    if (!guest) {
      throw new NotFoundException('Guest profile not found for this tenant');
    }

    const reservation = await this.reservationRepository.findById(
      ReservationId.create(command.reservationId),
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    if (reservation.getGuestId().toString() !== guest.getId()!.toString()) {
      throw new DomainException('Reservation does not belong to this guest');
    }
    if (reservation.getStatus().getValue() !== ReservationStatusEnum.PENDING) {
      throw new DomainException(
        'Only PENDING reservations can be added to cart for payment',
      );
    }

    const guestReservations = await this.reservationRepository.findByGuestId(
      command.tenantId,
      guest.getId()!.toString(),
      1,
      200,
    );

    GuestReservationOverlapChecker.check(
      guestReservations,
      reservation.getPropertyId().toString(),
      reservation.getDateRange(),
      command.reservationId,
    );

    let cart = await this.cartRepository.findOpenByGuestAndTenant(
      guestAccountId,
      tenantId,
    );
    cart ??= Cart.create({ tenantId, guestAccountId });

    cart.setReservationItem(
      CartReservationItem.create({
        reservationId: command.reservationId,
        totalPriceCopSnapshot: reservation.getTotalPrice(),
      }),
    );

    await this.cartRepository.save(cart);
  }
}
