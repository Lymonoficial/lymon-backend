export class LogoutCommand {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly tenantId: string,
  ) {}
}
