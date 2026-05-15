export class GeneratePresignedUrlQuery {
  constructor(
    public readonly fileName: string,
    public readonly contentType: string,
    public readonly tenantId: string,
  ) {}
}
