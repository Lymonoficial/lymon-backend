import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetExperienceByIdQuery } from './get-experience-by-id.query';
import { GetExperienceByIdResult } from './get-experience-by-id.result';
import {
  EXPERIENCE_REPOSITORY,
  type ExperienceRepository,
} from '@/domain/experience/repositories/experience.repository';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import {
  UNIT_REPOSITORY,
  type UnitRepository,
} from '@/domain/unit/repositories/unit.repository';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { mapExperienceToPublicDto } from '@/application/experience/queries/shared/experience.mapper';
import { ExperienceUnitSummaryDto } from '@/application/experience/queries/shared/experience-read.dto';

@QueryHandler(GetExperienceByIdQuery)
export class GetExperienceByIdQueryHandler implements IQueryHandler<
  GetExperienceByIdQuery,
  GetExperienceByIdResult
> {
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepository: ExperienceRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
  ) {}

  async execute(
    query: GetExperienceByIdQuery,
  ): Promise<GetExperienceByIdResult> {
    const experience = await this.experienceRepository.findById(
      ExperienceId.create(query.experienceId),
    );

    if (!experience || experience.getTenantId().toString() !== query.tenantId) {
      throw new NotFoundException(
        `Experience with id "${query.experienceId}" not found`,
      );
    }

    const rawPropertyId = experience.getPropertyId();
    const unitIds = experience.getUnitIds();

    const [property, units] = await Promise.all([
      rawPropertyId
        ? this.propertyRepository.findById(
            PropertyId.create(rawPropertyId.toString()),
          )
        : Promise.resolve(null),
      this.unitRepository.findByIds(
        unitIds.map((id) => UnitId.create(id.toString())),
      ),
    ]);

    const unitSummaries = units.map(
      (u) =>
        new ExperienceUnitSummaryDto(
          u.getId()!.toString(),
          u.getName(),
          u.getMaxGuests(),
          u.getPricePerNight(),
        ),
    );

    return new GetExperienceByIdResult(
      mapExperienceToPublicDto(experience),
      property?.getName() ?? null,
      unitSummaries,
    );
  }
}
