export class PropertyId {
  private constructor(private readonly value: string) {}

  static create(value: string): PropertyId {
    if (!value || value.trim() === '') {
      throw new Error('PropertyId cannot be empty');
    }
    return new PropertyId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PropertyId): boolean {
    return this.value === other.value;
  }
}
