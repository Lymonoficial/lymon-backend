export class SetTenantLogoCommand {
  constructor(
    public readonly tenantId: string,
    public readonly key: string,
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
