import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGuestAverageStayDurationQuery } from './get-guest-average-stay-duration.query';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

@QueryHandler(GetGuestAverageStayDurationQuery)
export class GetGuestAverageStayDurationHandler
  implements IQueryHandler<GetGuestAverageStayDurationQuery, number>
{
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(query: GetGuestAverageStayDurationQuery): Promise<number> {
    let guestId: GuestId;
    try {
      guestId = GuestId.createFromString(query.guestId);
    } catch {
      return 0;
    }

    const guest = await this.guestRepository.findById(guestId);
    if (!guest) {
      return 0;
    }

    const { totalBookings, totalNights } = guest.getSummary();

    if (!totalBookings) return 0;

    return Number.parseFloat(((totalNights ?? 0) / totalBookings).toFixed(1));
  }
}
