import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetExperienceByIdQuery } from './get-experience-by-id.query';
import { GetExperienceByIdResult } from './get-experience-by-id.result';
import {
  EXPERIENCE_REPOSITORY,
  type ExperienceRepository,
} from '@/domain/experience/repositories/experience.repository';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { mapExperienceToPublicDto } from '@/application/experience/queries/shared/experience.mapper';

@QueryHandler(GetExperienceByIdQuery)
export class GetExperienceByIdQueryHandler
  implements IQueryHandler<GetExperienceByIdQuery, GetExperienceByIdResult>
{
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepository: ExperienceRepository,
  ) {}

  async execute(query: GetExperienceByIdQuery): Promise<GetExperienceByIdResult> {
    const experience = await this.experienceRepository.findById(
      ExperienceId.create(query.experienceId),
    );

    if (!experience || experience.getTenantId().toString() !== query.tenantId) {
      throw new NotFoundException(
        `Experience with id "${query.experienceId}" not found`,
      );
    }

    return new GetExperienceByIdResult(mapExperienceToPublicDto(experience));
  }
}

