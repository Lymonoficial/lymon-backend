export class GetIncidentReportsByCreatorQuery {
  constructor(
    public readonly tenantId: string,
    public readonly createdBy: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
