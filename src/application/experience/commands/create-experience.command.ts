import { ExperienceAvailabilityTypeEnum } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategoryEnum } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceScopeEnum } from '@/domain/experience/value-objects/experience-scope.vo';

export interface CreateExperienceLocationInput {
  label: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface CreateExperienceBlackoutRangeInput {
  startAt: string;
  endAt: string;
}

export interface CreateExperienceRecurrenceInput {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export class CreateExperienceCommand {
  constructor(
    public readonly tenantId: string,
    public readonly scope: ExperienceScopeEnum,
    public readonly propertyId: string | undefined,
    public readonly unitIds: string[] | undefined,
    public readonly name: string,
    public readonly description: string,
    public readonly category: ExperienceCategoryEnum,
    public readonly priceCop: number,
    public readonly durationHours: number,
    public readonly capacity: number,
    public readonly coverImageUrl: string,
    public readonly location: CreateExperienceLocationInput,
    public readonly availabilityType: ExperienceAvailabilityTypeEnum,
    public readonly startAt: string | undefined,
    public readonly endAt: string | undefined,
    public readonly recurrence: CreateExperienceRecurrenceInput | undefined,
    public readonly blackoutRanges:
      | CreateExperienceBlackoutRangeInput[]
      | undefined,
    public readonly allowStandalonePurchase: boolean,
    public readonly allowReservationPurchase: boolean,
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
