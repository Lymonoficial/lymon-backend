export class IncidentReportDto {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly propertyId: string,
    public readonly createdBy: string,
    public readonly title: string,
    public readonly description: string,
    public readonly attachmentUrls: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class GetIncidentReportByIdResult {
  constructor(public readonly report: IncidentReportDto) {}
}
