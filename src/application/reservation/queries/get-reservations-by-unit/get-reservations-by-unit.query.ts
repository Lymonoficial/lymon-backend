export class GetReservationsByUnitQuery {
  constructor(
    public readonly tenantId: string,
    public readonly unitId: string,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
  ) {}
}
