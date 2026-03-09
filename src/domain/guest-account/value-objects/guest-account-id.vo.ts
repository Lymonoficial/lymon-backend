export class GuestAccountId {
  private constructor(private readonly value: string) {}

  static createFromString(value: string): GuestAccountId {
    if (!value || value.trim() === '') {
      throw new Error('GuestAccountId cannot be empty');
    }
    return new GuestAccountId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: GuestAccountId): boolean {
    return this.value === other.value;
  }
}
