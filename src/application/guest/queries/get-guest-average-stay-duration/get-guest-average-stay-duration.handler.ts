import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetGuestAverageStayDurationQuery } from './get-guest-average-stay-duration.query';
import { GUEST_REPOSITORY, type GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

@QueryHandler(GetGuestAverageStayDurationQuery)
export class GetGuestAverageStayDurationHandler implements IQueryHandler<GetGuestAverageStayDurationQuery, number> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(query: GetGuestAverageStayDurationQuery): Promise<number> {
    const { guestId } = query;

    const guest = await this.guestRepository.findById(GuestId.createFromString(guestId));
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }

    const totalBookings = guest.getSummary().totalBookings ?? 0;
    const totalNights = guest.getSummary().totalNights ?? 0;

    if (totalBookings === 0) return 0;

    return Number.parseFloat((totalNights / totalBookings).toFixed(1));
  }
}