import { Experience } from '@/domain/experience/entities/experience.entity';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

export const EXPERIENCE_REPOSITORY = 'EXPERIENCE_REPOSITORY';

export interface ExperienceRepository {
  save(
    experience: Experience,
    transactionContext?: TransactionContextData,
  ): Promise<string>;
  findById(id: ExperienceId): Promise<Experience | null>;
  existsByPropertyIdAndName(
    propertyId: PropertyId,
    name: string,
  ): Promise<boolean>;
}
