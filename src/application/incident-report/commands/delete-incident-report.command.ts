export class DeleteIncidentReportCommand {
  constructor(
    public readonly reportId: string,
    public readonly tenantId: string,
    public readonly actorId: string,
    public readonly actorEmail: string,
    /** True for OWNER and ADMIN — bypasses ownership check */
    public readonly canManageAll: boolean,
  ) {}
}
