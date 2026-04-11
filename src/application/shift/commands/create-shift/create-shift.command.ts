export class CreateShiftCommand {
  constructor(
    public readonly tenantId: string,
    public readonly staffMemberId: string,
    public readonly propertyId: string,
    public readonly date: string,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly notes?: string,
    public readonly actorId?: string,
    public readonly actorEmail?: string,
  ) {}
}
