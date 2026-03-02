export class GetIncidentReportByIdQuery {
  constructor(
    public readonly reportId: string,
    public readonly tenantId: string,
  ) {}
}
