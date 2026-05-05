import { Inject, Injectable } from '@nestjs/common';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { GuestStatusEnum } from '@/domain/guest/entities/guest.types';
import {
  GUEST_TAG_REPOSITORY,
  type GuestTagRepository,
} from '@/domain/guest-tag/repositories/guest-tag.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@Injectable()
export class SearchGuestsQuery {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    @Inject(GUEST_TAG_REPOSITORY)
    private readonly guestTagRepository: GuestTagRepository,
  ) {}

  async execute(
    tenantId: TenantId,
    term: string,
    page: number,
    limit: number,
    sortBy: 'createdAt' | 'fullName' | 'status',
    sortDirection: 'asc' | 'desc',
    tagNames?: string[],
    statuses?: GuestStatusEnum[],
  ): Promise<{ guests: Guest[]; total: number }> {
    const sanitizedTerm = term?.trim().toLowerCase();

    let tagIds: string[] | undefined;
    if (tagNames?.length) {
      const tags = await this.guestTagRepository.findByNames(
        tagNames,
        tenantId.toString(),
      );
      if (!tags.length) {
        return { guests: [], total: 0 };
      }
      tagIds = tags.map((t) => t.getId()!.toString());
    }

    const filters = { statuses, tagIds };

    if (!sanitizedTerm) {
      return this.guestRepository.findByTenantIdPaginated(
        tenantId,
        page,
        limit,
        sortBy,
        sortDirection,
        filters,
      );
    }

    return this.guestRepository.searchPaginated(
      tenantId,
      sanitizedTerm,
      page,
      limit,
      filters,
    );
  }
}
