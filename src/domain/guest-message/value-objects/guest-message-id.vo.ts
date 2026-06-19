import { v4 as uuidv4 } from 'uuid';

export class GuestMessageId {
  private constructor(private readonly value: string) {}

  static create(): GuestMessageId {
    return new GuestMessageId(uuidv4());
  }

  static createFromString(value: string): GuestMessageId {
    if (!value || value.trim() === '') {
      throw new Error('GuestMessageId cannot be empty');
    }
    return new GuestMessageId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: GuestMessageId): boolean {
    return this.value === other.value;
  }
}
