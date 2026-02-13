export enum PlanTypeEnum {
  LYMON_ONE = 'LYMON_ONE',
  LYMON_PLUS = 'LYMON_PLUS',
  LYMON_PRIME = 'LYMON_PRIME',
  TRIAL = 'TRIAL',
}

export class PlanType {
  private readonly value: PlanTypeEnum;

  private constructor(value: PlanTypeEnum) {
    this.value = value;
  }

  static create(value: string): PlanType {
    if (!Object.values(PlanTypeEnum).includes(value as PlanTypeEnum)) {
      throw new Error(`Invalid plan type ${value}`);
    }
    return new PlanType(value as PlanTypeEnum);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PlanType): boolean {
    return this.value === other.value;
  }

  isTrial(): boolean {
    return this.value === PlanTypeEnum.TRIAL;
  }
}
