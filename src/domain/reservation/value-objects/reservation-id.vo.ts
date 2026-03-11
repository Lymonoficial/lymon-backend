export class ReservationId {
  private constructor(private readonly value: string) {}

  static create(value: string): ReservationId {
    if (!value || value.trim() === '') {
      throw new Error('ReservationId cannot be empty');
    }
    return new ReservationId(value.trim());
  }

  toString(): string {
    return this.value;
  }

  equals(other: ReservationId): boolean {
    return this.value === other.value;
  }
}
