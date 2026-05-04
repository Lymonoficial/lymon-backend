import type {
  CreateExperienceBlackoutRangeInput,
  CreateExperienceLocationInput,
  CreateExperienceRecurrenceInput,
} from '@/application/experience/commands/create-experience.command';
import { ExperienceAvailabilityTypeEnum } from '@/domain/experience/value-objects/experience-availability-type.vo';

export class UpdateExperienceCommand {
  constructor(
    public readonly experienceId: string,
    public readonly tenantId: string,
    public readonly name: string | undefined,
    public readonly description: string | undefined,
    public readonly priceCop: number | undefined,
    public readonly durationHours: number | undefined,
    public readonly capacity: number | undefined,
    public readonly coverImageUrl: string | undefined,
    public readonly location: CreateExperienceLocationInput | undefined,
    public readonly availabilityType:
      | ExperienceAvailabilityTypeEnum
      | undefined,
    public readonly startAt: string | undefined,
    public readonly endAt: string | undefined,
    public readonly recurrence: CreateExperienceRecurrenceInput | undefined,
    public readonly blackoutRanges:
      | CreateExperienceBlackoutRangeInput[]
      | undefined,
    public readonly allowStandalonePurchase: boolean | undefined,
    public readonly allowReservationPurchase: boolean | undefined,
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
