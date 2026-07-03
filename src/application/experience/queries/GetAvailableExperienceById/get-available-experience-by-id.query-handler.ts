import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAvailableExperienceByIdQuery } from './get-available-experience-by-id.query';
import { GetAvailableExperienceByIdResult } from './get-available-experience-by-id.result';
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
import { ExperienceStatus } from '@/domain/experience/value-objects/experience-status.vo';
import { mapExperienceToPublicDto } from '@/application/experience/queries/shared/experience.mapper';
import { ExperienceUnitSummaryDto } from '@/application/experience/queries/shared/experience-read.dto';
import {
  R2StorageService,
  R2_STORAGE_SERVICE,
} from '@/infrastructure/storage/r2-storage.service';

@QueryHandler(GetAvailableExperienceByIdQuery)
export class GetAvailableExperienceByIdQueryHandler implements IQueryHandler<
  GetAvailableExperienceByIdQuery,
  GetAvailableExperienceByIdResult
> {
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepository: ExperienceRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    @Inject(R2_STORAGE_SERVICE)
    private readonly storage: R2StorageService,
  ) {}

  async execute(
    query: GetAvailableExperienceByIdQuery,
  ): Promise<GetAvailableExperienceByIdResult> {
    const experience = await this.experienceRepository.findById(
      ExperienceId.create(query.experienceId),
    );

    if (
      experience?.getStatus().toString() !==
      ExperienceStatus.active().toString()
    ) {
      throw new NotFoundException(
        `Experience with id "${query.experienceId}" not found`,
      );
    }

    const dto = mapExperienceToPublicDto(experience, (k) =>
      this.storage.getPublicUrl(k),
    );

    const propertyId = experience.getPropertyId();
    let propertyName: string | null = null;
    if (propertyId) {
      const property = await this.propertyRepository.findById(propertyId);
      propertyName = property?.getName() ?? null;
    }

    const unitIds = experience.getUnitIds();
    let units: ExperienceUnitSummaryDto[] = [];
    if (unitIds.length > 0) {
      const unitEntities = await this.unitRepository.findByIds(unitIds);
      units = unitEntities.map(
        (u) =>
          new ExperienceUnitSummaryDto(
            u.getId()!.toString(),
            u.getName(),
            u.getMaxGuests(),
            u.getPricePerNight(),
          ),
      );
    }

    return new GetAvailableExperienceByIdResult({
      experience: dto,
      propertyName,
      units,
    });
  }
}
