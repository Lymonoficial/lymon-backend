import { ExperienceRepository } from '@/domain/experience/repositories/experience.repository';

export function createExperienceRepositoryMock(): jest.Mocked<ExperienceRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    existsByPropertyIdAndName: jest.fn(),
  };
}
