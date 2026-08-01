export class GuestDocumentId {
  private constructor(private readonly value: string) {}

  static createFromString(value: string): GuestDocumentId {
    if (!value || value.trim() === '') {
      throw new Error('GuestDocumentId cannot be empty');
    }
    return new GuestDocumentId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: GuestDocumentId): boolean {
    return this.value === other.value;
  }
}
