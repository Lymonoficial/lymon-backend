import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAvailableExperiencesQuery } from './get-available-experiences.query';
import { GetAvailableExperiencesResult } from './get-available-experiences.result';
import {
  EXPERIENCE_REPOSITORY,
  type ExperienceRepository,
} from '@/domain/experience/repositories/experience.repository';
import { ExperienceCategory } from '@/domain/experience/value-objects/experience-category.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { mapExperienceToPublicDto } from '@/application/experience/queries/shared/experience.mapper';

@QueryHandler(GetAvailableExperiencesQuery)
export class GetAvailableExperiencesQueryHandler implements IQueryHandler<
  GetAvailableExperiencesQuery,
  GetAvailableExperiencesResult
> {
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepository: ExperienceRepository,
  ) {}

  async execute(
    query: GetAvailableExperiencesQuery,
  ): Promise<GetAvailableExperiencesResult> {
    let tenantId: TenantId | undefined;
    let propertyId: PropertyId | undefined;
    let category: ExperienceCategory | undefined;

    try {
      if (query.tenantId) tenantId = TenantId.createFromString(query.tenantId);
    } catch {
      // invalid tenantId → no filter
    }

    try {
      if (query.propertyId) propertyId = PropertyId.create(query.propertyId);
    } catch {
      // invalid propertyId → no filter
    }

    try {
      if (query.category) category = ExperienceCategory.create(query.category);
    } catch {
      // invalid category → no filter
    }

    const { experiences, total } =
      await this.experienceRepository.findAvailableForGuestPaginated(
        { tenantId, propertyId, category },
        query.page,
        query.limit,
      );

    return new GetAvailableExperiencesResult(
      experiences.map(mapExperienceToPublicDto),
      total,
      query.page,
      query.limit,
    );
  }
}
