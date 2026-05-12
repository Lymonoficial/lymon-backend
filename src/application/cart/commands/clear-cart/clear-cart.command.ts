export class ClearCartCommand {
  constructor(
    readonly guestAccountId: string,
    readonly tenantId: string,
  ) {}
}
