export class GuestId {
  private constructor(private readonly value: string) {}

  static createFromString(value: string): GuestId {
    if (!value || value.trim() === '') {
      throw new Error('GuestId cannot be empty');
    }

    return new GuestId(value);
  }

  toString(): string {
    return this.value;
  }
}
