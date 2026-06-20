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
    const { tenantId, guestId } = query;
    
    const guest = await this.guestRepository.findById(GuestId.createFromString(guestId));
    
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }

    const stats = await this.reservationRepository.getBookingValueStats(tenantId, guestId);

    let averageBookingValue: number = 0;

    if (stats.bookingCount > 0) {
      averageBookingValue = Math.round(stats.totalRevenue / stats.bookingCount);
    }

    const totalBookings = guest.getSummary().totalBookings ?? 0;
    const totalNights = guest.getSummary().totalNights ?? 0;

    const avgNightsPerStay = totalBookings > 0 
      ? Number.parseFloat((totalNights / totalBookings).toFixed(1)) 
      : 0;
    
    const bookingValueStats = await this.reservationRepository.getBookingValueStats(tenantId, guestId);

    if (bookingValueStats.bookingCount > 0) {
      averageBookingValue = Math.round(bookingValueStats.totalRevenue / bookingValueStats.bookingCount);
    }

    const lastStayDate = await this.reservationRepository.getLastStayAt(tenantId, guestId);

    let lastStayAt: string | null = null;
    let daysSinceLastStay: number | null = null;

    if (lastStayDate) {
      lastStayAt = lastStayDate.toISOString();

      const today = new Date(); // "now" del servidor
      const diffInMs = today.getTime() - lastStayDate.getTime();
      
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      daysSinceLastStay = Math.max(0, diffInDays);
    }

    return new GetGuestMetricsResult(
      totalBookings,
      totalNights,
      avgNightsPerStay,
      averageBookingValue,
      lastStayAt,
      daysSinceLastStay,
    );
  }
}