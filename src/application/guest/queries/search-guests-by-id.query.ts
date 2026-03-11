import { Inject, Injectable } from '@nestjs/common';
import { GUEST_REPOSITORY, type GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

@Injectable()
export class SearchGuestByIdQuery {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(tenantId: TenantId, guestIdStr: string): Promise<Guest | null> {
    const guestId = GuestId.createFromString(guestIdStr);
    const guest = await this.guestRepository.findById(guestId);

    if (!guest || !guest.getTenantId().equals(tenantId)) {
      return null;
    }

    return guest;
  }
}