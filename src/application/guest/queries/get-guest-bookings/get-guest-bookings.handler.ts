import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGuestBookingsQuery } from './get-guest-bookings.query';
import { GetGuestBookingsResult, GuestBookingDto } from './get-guest-bookings.result';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

@QueryHandler(GetGuestBookingsQuery)
export class GetGuestBookingsHandler
  implements IQueryHandler<GetGuestBookingsQuery, GetGuestBookingsResult>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(query: GetGuestBookingsQuery): Promise<GetGuestBookingsResult> {
    const tenantId = query.tenantId;
    let guestId: GuestId;

    try {
      guestId = GuestId.createFromString(query.guestId);
    } catch {
      return { items: [] };
    }

    const reservations = await this.reservationRepository.findByGuestId(
      tenantId,
      guestId.toString(),
      1,
      100,
    );

    const items: GuestBookingDto[] = reservations
      .filter((res) => res.getTenantId().toString() === tenantId)
      .sort(
        (a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime(),
      )
      .map((res) => ({
        id: res.getId()!.toString(),
        property: res.getPropertyId().toString(),
        unit: res.getUnitId().toString(),
        checkIn: res.getDateRange().getCheckIn(),
        checkOut: res.getDateRange().getCheckOut(),
        status: res.getStatus().toString(),
        totalAmount: res.getTotalPrice(),
        source: res.getSource().toString(),
        createdAt: res.getCreatedAt(),
      }));

    return { items };
  }
}
