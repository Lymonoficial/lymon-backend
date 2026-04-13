import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetGuestByIdQuery } from './get-guest-by-id.query';
import type { GetGuestByIdResult } from './get-guest-by-id.result';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

@QueryHandler(GetGuestByIdQuery)
export class GetGuestByIdHandler implements IQueryHandler<
  GetGuestByIdQuery,
  GetGuestByIdResult
> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(query: GetGuestByIdQuery): Promise<GetGuestByIdResult> {
    const tenantId = TenantId.createFromString(query.tenantId);
    let guestId: GuestId;

    try {
      guestId = GuestId.createFromString(query.guestId);
    } catch {
      return { item: null };
    }

    const guest = await this.guestRepository.findById(guestId);

    if (!guest?.getTenantId()?.equals(tenantId)) {
      return { item: null };
    }

    return {
      item: {
        id: guest.getId()!.toString(),
        fullName: guest.getFullName(),
        firstName: guest.getFirstName(),
        lastName: guest.getLastName(),
        primaryEmail: guest.getPrimaryEmail(),
        emails: guest.getEmails(),
        phones: guest.getPhones().map((p) => ({
          number: p.number,
          type: p.type,
          isPrimary: p.isPrimary,
        })),
        status: guest.getStatus(),
        tags: guest.getTags(),
        preferencesNotes: guest.getPreferencesNotes() || null,
        summary: guest.getSummary()
          ? {
              totalBookings: guest.getSummary().totalBookings,
              totalNights: guest.getSummary().totalNights,
              totalSpend: guest.getSummary().totalSpend,
              lastStayAt: guest.getSummary().lastStayAt,
              lastPropertyId:
                guest.getSummary().lastPropertyId?.toString() ?? null,
              lastUnitId: guest.getSummary().lastUnitId?.toString() ?? null,
            }
          : null,
        createdAt: guest.getCreatedAt().toISOString(),
        updatedAt: guest.getUpdatedAt().toISOString(),
      },
    };
  }
}
