export enum ExperienceAvailabilityTypeEnum {
  ONE_TIME = 'ONE_TIME',
  DATE_RANGE = 'DATE_RANGE',
  RECURRING = 'RECURRING',
}

export class ExperienceAvailabilityType {
  private constructor(private readonly value: ExperienceAvailabilityTypeEnum) {}

  static create(value: string): ExperienceAvailabilityType {
    if (
      !Object.values(ExperienceAvailabilityTypeEnum).includes(
        value as ExperienceAvailabilityTypeEnum,
      )
    ) {
      throw new Error('Invalid availability type');
    }

    return new ExperienceAvailabilityType(
      value as ExperienceAvailabilityTypeEnum,
    );
  }

  isRecurring(): boolean {
    return this.value === ExperienceAvailabilityTypeEnum.RECURRING;
  }

  isOneTime(): boolean {
    return this.value === ExperienceAvailabilityTypeEnum.ONE_TIME;
  }

  isDateRange(): boolean {
    return this.value === ExperienceAvailabilityTypeEnum.DATE_RANGE;
  }

  toString(): string {
    return this.value;
  }
}
