import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAvailableExperienceByIdQuery } from './get-available-experience-by-id.query';
import { GetAvailableExperienceByIdResult } from './get-available-experience-by-id.result';
import {
  EXPERIENCE_REPOSITORY,
  type ExperienceRepository,
} from '@/domain/experience/repositories/experience.repository';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { ExperienceStatus } from '@/domain/experience/value-objects/experience-status.vo';
import { mapExperienceToPublicDto } from '@/application/experience/queries/shared/experience.mapper';

@QueryHandler(GetAvailableExperienceByIdQuery)
export class GetAvailableExperienceByIdQueryHandler
  implements
    IQueryHandler<GetAvailableExperienceByIdQuery, GetAvailableExperienceByIdResult>
{
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepository: ExperienceRepository,
  ) {}

  async execute(
    query: GetAvailableExperienceByIdQuery,
  ): Promise<GetAvailableExperienceByIdResult> {
    const experience = await this.experienceRepository.findById(
      ExperienceId.create(query.experienceId),
    );

    if (!experience || experience.getStatus().toString() !== ExperienceStatus.active().toString()) {
      throw new NotFoundException(
        `Experience with id "${query.experienceId}" not found`,
      );
    }

    return new GetAvailableExperienceByIdResult(
      mapExperienceToPublicDto(experience),
    );
  }
}

