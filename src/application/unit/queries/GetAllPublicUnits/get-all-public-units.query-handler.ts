import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllPublicUnitsQuery } from './get-all-public-units.query';
import { GetAllPublicUnitsResult } from './get-all-public-units.result';
import { UNIT_REPOSITORY } from '@/domain/unit/repositories/unit.repository';
import type { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import { mapUnitToPublicDto } from '@/application/reservation/queries/shared/unit.mapper';

@QueryHandler(GetAllPublicUnitsQuery)
export class GetAllPublicUnitsQueryHandler implements IQueryHandler<
  GetAllPublicUnitsQuery,
  GetAllPublicUnitsResult
> {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
  ) {}

  async execute(
    query: GetAllPublicUnitsQuery,
  ): Promise<GetAllPublicUnitsResult> {
    const { units, total } = await this.unitRepository.findAllPaginated(
      query.page,
      query.limit,
    );
    const dtos = units.map(mapUnitToPublicDto);

    return new GetAllPublicUnitsResult(dtos, total, query.page, query.limit);
  }
}
