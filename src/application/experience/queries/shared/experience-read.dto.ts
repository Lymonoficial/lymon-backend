export class PublicExperienceLocationDto {
  constructor(
    public readonly label: string | undefined,
    public readonly address: string | undefined,
    public readonly lat: number | undefined,
    public readonly lng: number | undefined,
  ) {}
}

export class PublicExperienceRecurrenceDto {
  constructor(
    public readonly daysOfWeek: number[],
    public readonly startTime: string,
    public readonly endTime: string,
  ) {}
}

export class PublicExperienceBlackoutRangeDto {
  constructor(
    public readonly startAt: Date,
    public readonly endAt: Date,
  ) {}
}

export class ExperienceUnitSummaryDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly maxGuests: number,
    public readonly pricePerNight: number,
  ) {}
}

export class PublicExperienceDto {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly propertyId: string | null,
    public readonly scope: string,
    public readonly unitIds: string[],
    public readonly name: string,
    public readonly description: string,
    public readonly city: string,
    public readonly category: string,
    public readonly priceCop: number,
    public readonly durationHours: number | null,
    public readonly minimumParticipants: number,
    public readonly capacity: number,
    public readonly location: PublicExperienceLocationDto | null,
    public readonly availabilityType: string,
    public readonly startAt: Date | null,
    public readonly endAt: Date | null,
    public readonly recurrence: PublicExperienceRecurrenceDto | null,
    public readonly blackoutRanges: PublicExperienceBlackoutRangeDto[],
    public readonly allowStandalonePurchase: boolean,
    public readonly allowReservationPurchase: boolean,
    public readonly minNoticeHours: number,
    public readonly purchaseCutoffHours: number,
    public readonly status: string,
    public readonly mediaUrls: string[],
  ) {}
}
