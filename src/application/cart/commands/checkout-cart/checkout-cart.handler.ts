import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { ExperiencePurchase } from '@/domain/experience-purchase/entities/experience-purchase.entity';
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
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';

@CommandHandler(CheckoutCartCommand)
export class CheckoutCartHandler
  implements ICommandHandler<CheckoutCartCommand>
{
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CheckoutCartCommand): Promise<void> {
    const guestAccountId = GuestAccountId.createFromString(
      command.guestAccountId,
    );
    const tenantId = TenantId.createFromString(command.tenantId);

    const cart = await this.cartRepository.findOpenByGuestAndTenant(
      guestAccountId,
      tenantId,
    );
    if (!cart) {
      throw new NotFoundException('No open cart found');
    }
    if (cart.getExperienceItems().length === 0 && !cart.getReservationItem()) {
      throw new DomainException('Cannot checkout an empty cart');
    }

    const guest = await this.guestRepository.findByGuestAccountId(
      tenantId,
      guestAccountId,
    );
    if (!guest) {
      throw new NotFoundException('Guest profile not found for this tenant');
    }

    const reservationItem = cart.getReservationItem();
    if (reservationItem) {
      await this.processReservationItem(reservationItem, guest, command);
    }

    for (const item of cart.getExperienceItems()) {
      await this.processExperienceItem(item, tenantId, guestAccountId, command);
    }

    cart.checkout();
    await this.cartRepository.save(cart);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.CART_CHECKED_OUT,
        AuditEntityType.CART,
        cart.getId()?.toString(),
        { totalCop: cart.getTotalCop() },
      ),
    );
  }

  private async processReservationItem(
    reservationItem: CartReservationItem,
    guest: Guest,
    command: CheckoutCartCommand,
  ): Promise<void> {
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
      command.tenantId,
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

    reservation.pay();
    await this.reservationRepository.save(reservation);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.RESERVATION_PAID,
        AuditEntityType.RESERVATION,
        reservationItem.reservationId,
      ),
    );
  }

  private async processExperienceItem(
    item: CartItem,
    tenantId: TenantId,
    guestAccountId: GuestAccountId,
    command: CheckoutCartCommand,
  ): Promise<void> {
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

    const purchase = ExperiencePurchase.create({
      tenantId,
      guestAccountId,
      experienceId: ExperienceId.create(item.experienceId.toString()),
      reservationId: item.reservationId ?? null,
      selectedDate: item.selectedDate ?? null,
      quantity: item.quantity,
      unitPriceCop: item.unitPriceCopSnapshot,
    });

    const purchaseId = await this.experiencePurchaseRepository.save(purchase);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.EXPERIENCE_PURCHASED,
        AuditEntityType.EXPERIENCE_PURCHASE,
        purchaseId,
        {
          experienceId: item.experienceId.toString(),
          quantity: item.quantity,
          totalPriceCop: item.getTotalCop(),
        },
      ),
    );
  }
}
