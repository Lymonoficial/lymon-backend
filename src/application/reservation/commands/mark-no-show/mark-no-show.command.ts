export class MarkNoShowCommand {
  constructor(
    public readonly reservationId: string,
    public readonly tenantId: string,
    public readonly actorId: string,
    public readonly actorEmail: string,
  ) {}
}
