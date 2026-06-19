export class RefundRequestId {
  private constructor(private readonly value: string) {}

  static create(value: string): RefundRequestId {
    if (!value || value.trim() === '') {
      throw new Error('RefundRequestId cannot be empty');
    }
    return new RefundRequestId(value);
  }

  static createFromString(value: string): RefundRequestId {
    return RefundRequestId.create(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: RefundRequestId): boolean {
    return this.value === other.value;
  }
}
