export class CreateIncidentReportCommand {
  constructor(
    public readonly tenantId: string,
    public readonly propertyId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly attachmentUrls: string[] = [],
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
