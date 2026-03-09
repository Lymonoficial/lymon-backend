export class UpdateIncidentReportCommand {
  constructor(
    public readonly reportId: string,
    public readonly tenantId: string,
    public readonly title: string | undefined,
    public readonly description: string | undefined,
    public readonly attachmentUrls: string[] | undefined,
    public readonly actorId: string,
    public readonly actorEmail: string,
    /** True for OWNER and ADMIN — bypasses ownership check */
    public readonly canManageAll: boolean,
  ) {}
}
