export class DeletePropertyCommand {
  constructor(
    public readonly propertyId: string,
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly isOwner: boolean,
  ) {}
}
