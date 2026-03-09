export class UpdateTenantProfileCommand {
  constructor(
    public readonly tenantId: string,
    public readonly name: string | undefined,
    public readonly contactPhone: string | null | undefined,
    public readonly address: string | null | undefined,
    public readonly website: string | null | undefined,
    public readonly logoUrl: string | null | undefined,
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
