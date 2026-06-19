import { PublicExperienceDto } from '@/application/experience/queries/shared/experience-read.dto';

export class GetAvailableExperienceByIdResult {
  constructor(public readonly experience: PublicExperienceDto) {}
}
