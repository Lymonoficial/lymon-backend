export enum CancellationPolicyEnum {
  FLEXIBLE = 'FLEXIBLE',
  STANDARD = 'STANDARD',
  STRICT = 'STRICT',
}

export class CancellationPolicy {
  private readonly value: CancellationPolicyEnum;

  private constructor(value: CancellationPolicyEnum) {
    this.value = value;
  }

  static create(value: string): CancellationPolicy {
    if (
      !Object.values(CancellationPolicyEnum).includes(
        value as CancellationPolicyEnum,
      )
    ) {
      throw new Error(`Invalid cancellation policy ${value}`);
    }
    return new CancellationPolicy(value as CancellationPolicyEnum);
  }

  toString(): string {
    return this.value;
  }

  equals(other: CancellationPolicy): boolean {
    return this.value === other.value;
  }
}
