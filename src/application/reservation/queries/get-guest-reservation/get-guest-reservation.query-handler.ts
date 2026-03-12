import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetGuestReservationQuery } from './get-guest-reservation.query';
import { ReservationDto } from '../shared/reservation.dto';
import { toReservationDto } from '../shared/reservation.mapper';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';

@QueryHandler(GetGuestReservationQuery)
export class GetGuestReservationHandler implements IQueryHandler<
  GetGuestReservationQuery,
  ReservationDto
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(query: GetGuestReservationQuery): Promise<ReservationDto> {
    const tenantId = TenantId.createFromString(query.tenantId);
    const guestAccountId = GuestAccountId.createFromString(
      query.guestAccountId,
    );

    const guestProfile = await this.guestRepository.findByGuestAccountId(
      tenantId,
      guestAccountId,
    );
    if (!guestProfile) {
      throw new NotFoundException('No guest profile found for this property.');
    }

    const id = ReservationId.create(query.reservationId);
    const reservation = await this.reservationRepository.findById(id);

    if (
      !reservation ||
      reservation.getTenantId().toString() !== query.tenantId
    ) {
      throw new NotFoundException('Reservation not found');
    }

    if (
      reservation.getGuestId().toString() !== guestProfile.getId()!.toString()
    ) {
      throw new ForbiddenException(
        'You do not have access to this reservation.',
      );
    }

    return toReservationDto(reservation);
  }
}
