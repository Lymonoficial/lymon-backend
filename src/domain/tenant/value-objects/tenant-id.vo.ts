export class TenantId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static createFromString(value: string): TenantId {
    if (!value || value.trim() === '') {
      throw new Error('TenantId cannot be empty');
    }
    return new TenantId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: TenantId): boolean {
    return this.value === other.value;
  }
}
