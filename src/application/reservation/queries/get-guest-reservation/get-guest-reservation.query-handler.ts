import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetGuestReservationQuery } from './get-guest-reservation.query';
import { GuestReservationDetailResult } from './get-guest-reservation.result';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import {
  UNIT_REPOSITORY,
  type UnitRepository,
} from '@/domain/unit/repositories/unit.repository';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';

@QueryHandler(GetGuestReservationQuery)
export class GetGuestReservationHandler implements IQueryHandler<
  GetGuestReservationQuery,
  GuestReservationDetailResult
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
  ) {}

  async execute(
    query: GetGuestReservationQuery,
  ): Promise<GuestReservationDetailResult> {
    const guestAccountId = GuestAccountId.createFromString(
      query.guestAccountId,
    );

    const id = ReservationId.create(query.reservationId);
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const guestRecord = await this.guestRepository.findById(
      reservation.getGuestId(),
    );

    if (!guestRecord?.getGuestAccountId()) {
      throw new ForbiddenException(
        'You do not have access to this reservation.',
      );
    }

    if (
      guestRecord.getGuestAccountId()!.toString() !== guestAccountId.toString()
    ) {
      throw new ForbiddenException(
        'You do not have access to this reservation.',
      );
    }

    const [property, unit] = await Promise.all([
      this.propertyRepository.findById(reservation.getPropertyId()),
      this.unitRepository.findById(reservation.getUnitId()),
    ]);

    const nights = reservation.getDateRange().nights();
    const totalPrice = reservation.getTotalPrice();

    return {
      id: reservation.getId()!.toString(),
      bookingReference: reservation.getId()!.toString(),
      propertyId: reservation.getPropertyId().toString(),
      propertyName: property?.getName() ?? null,
      unitId: reservation.getUnitId().toString(),
      unitName: unit?.getName() ?? null,
      serviceName: unit?.getName() ?? property?.getName() ?? 'Reservation',
      checkIn: reservation.getDateRange().getCheckIn(),
      checkOut: reservation.getDateRange().getCheckOut(),
      nights,
      status: reservation.getStatus().toString(),
      guestsCount: reservation.getGuestsCount(),
      notes: reservation.getNotes(),
      source: reservation.getSource().toString(),
      cancellationReason: reservation.getCancellationReason(),
      cancelledAt: reservation.getCancelledAt(),
      checkInActualAt: reservation.getCheckInActualAt(),
      checkOutActualAt: reservation.getCheckOutActualAt(),
      priceBreakdown: {
        pricePerNight: reservation.getPricePerNight(),
        nights,
        totalPrice,
      },
      actions: {
        contactSupport: {
          enabled: true,
          channel: 'email',
        },
      },
    };
  }
}
