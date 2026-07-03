export class GenerateTenantLogoUrlQuery {
  constructor(
    public readonly tenantId: string,
    public readonly contentType: string,
    public readonly fileSize: number,
  ) {}
}
