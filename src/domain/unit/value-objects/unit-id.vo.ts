export class UnitId {
  private constructor(private readonly value: string) {}

  static create(value: string): UnitId {
    if (!value || value.trim() === '') {
      throw new Error('UnitId cannot be empty');
    }
    return new UnitId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UnitId): boolean {
    return this.value === other.value;
  }
}
