import { Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPublicUnitByIdQuery } from './get-public-unit-by-id.query';
import { GetPublicUnitByIdResult } from './get-public-unit-by-id.result';
import { UNIT_REPOSITORY } from '@/domain/unit/repositories/unit.repository';
import type { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { mapUnitToPublicDto } from '@/application/reservation/queries/shared/unit.mapper';

@QueryHandler(GetPublicUnitByIdQuery)
export class GetPublicUnitByIdQueryHandler implements IQueryHandler<
  GetPublicUnitByIdQuery,
  GetPublicUnitByIdResult
> {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
  ) {}

  async execute(
    query: GetPublicUnitByIdQuery,
  ): Promise<GetPublicUnitByIdResult> {
    const unitId = UnitId.create(query.unitId);
    const unit = await this.unitRepository.findById(unitId);

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    const dto = mapUnitToPublicDto(unit);

    return new GetPublicUnitByIdResult(dto);
  }
}
