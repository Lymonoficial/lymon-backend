import { DomainException } from '@/domain/shared/exceptions/domain.exception';

export class PropertyId {
  private static readonly OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

  private constructor(private readonly value: string) {}

  static create(value: string): PropertyId {
    if (!value || value.trim() === '') {
      throw new DomainException('PropertyId cannot be empty');
    }
    if (!PropertyId.OBJECT_ID_REGEX.test(value)) {
      throw new DomainException('PropertyId must be a valid 24-character hex identifier');
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
