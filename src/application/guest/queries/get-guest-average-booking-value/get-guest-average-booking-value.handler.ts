import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGuestAverageBookingValueQuery } from './get-guest-average-booking-value.query';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

@QueryHandler(GetGuestAverageBookingValueQuery)
export class GetGuestAverageBookingValueHandler
  implements IQueryHandler<GetGuestAverageBookingValueQuery, number>
{
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(query: GetGuestAverageBookingValueQuery): Promise<number> {
    let guestId: GuestId;
    try {
      guestId = GuestId.createFromString(query.guestId);
    } catch {
      return 0;
    }

    const stats = await this.reservationRepository.getBookingValueStats(
      query.tenantId,
      guestId.toString(),
    );

    if (stats.bookingCount === 0) {
      return 0;
    }

    return Math.round(stats.totalRevenue / stats.bookingCount);
  }
}
