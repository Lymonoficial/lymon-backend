export class IncidentReportId {
  private constructor(private readonly value: string) {}

  static create(value: string): IncidentReportId {
    if (!value || value.trim() === '') {
      throw new Error('IncidentReportId cannot be empty');
    }
    return new IncidentReportId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: IncidentReportId): boolean {
    return this.value === other.value;
  }
}
