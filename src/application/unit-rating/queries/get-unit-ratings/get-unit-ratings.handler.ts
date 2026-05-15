import { Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUnitRatingsQuery } from './get-unit-ratings.query';
import {
  GetUnitRatingsResult,
  UnitRatingDto,
} from './get-unit-ratings.result';
import {
  UNIT_RATING_REPOSITORY,
  type UnitRatingRepository,
} from '@/domain/unit-rating/repositories/unit-rating.repository';
import {
  UNIT_REPOSITORY,
  type UnitRepository,
} from '@/domain/unit/repositories/unit.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@QueryHandler(GetUnitRatingsQuery)
export class GetUnitRatingsHandler
  implements IQueryHandler<GetUnitRatingsQuery>
{
  constructor(
    @Inject(UNIT_RATING_REPOSITORY)
    private readonly unitRatingRepository: UnitRatingRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
  ) {}

  async execute(query: GetUnitRatingsQuery): Promise<GetUnitRatingsResult> {
    const unitId = UnitId.create(query.unitId);
    const tenantId = TenantId.createFromString(query.tenantId);

    const unit = await this.unitRepository.findById(unitId);
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    if (!unit.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Unit not found');
    }

    const { ratings, total } =
      await this.unitRatingRepository.findByUnitIdPaginated(
        unitId,
        query.page,
        query.limit,
      );

    const dtos = ratings.map(
      (r) =>
        new UnitRatingDto(
          r.getId()!.toString(),
          r.getUnitId().toString(),
          r.getGuestId().toString(),
          r.getReservationId().toString(),
          r.getRate(),
          r.getMessage(),
          r.getCreatedAt(),
        ),
    );

    return new GetUnitRatingsResult(dtos, total, query.page, query.limit);
  }
}
