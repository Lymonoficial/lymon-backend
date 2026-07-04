import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { GetGuestMetricsQuery } from './get-guest-metrics.query';
import { GetGuestMetricsResult } from './get-guest-metrics.result';
import { GUEST_REPOSITORY, type GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { RESERVATION_REPOSITORY, type ReservationRepository } from '@/domain/reservation/repositories/reservation.repository';


@QueryHandler(GetGuestMetricsQuery)
export class GetGuestMetricsHandler implements IQueryHandler<GetGuestMetricsQuery, GetGuestMetricsResult> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    
    @Inject(RESERVATION_REPOSITORY) 
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(query: GetGuestMetricsQuery): Promise<GetGuestMetricsResult> {
    const { tenantId, guestId, type } = query;
    
    const guest = await this.guestRepository.findById(GuestId.createFromString(guestId));
    
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }

    let totalBookings = 0;
    let totalNights = 0;
    let avgNightsPerStay = 0;
    let averageBookingValue = 0;

    if (!type || type === 'averageBookingValue') {
      const stats = await this.reservationRepository.getBookingValueStats(tenantId, guestId);
      if (stats.bookingCount > 0) {
        averageBookingValue = Math.round(stats.totalRevenue / stats.bookingCount);
      }
    }
    
    if (!type) {
      totalBookings = guest.getSummary().totalBookings ?? 0;
      totalNights = guest.getSummary().totalNights ?? 0;
      avgNightsPerStay = totalBookings > 0 
        ? Number.parseFloat((totalNights / totalBookings).toFixed(1)) 
        : 0;
    }

    return new GetGuestMetricsResult(
      totalBookings,
      totalNights,
      avgNightsPerStay,
      averageBookingValue
    );
  }
}