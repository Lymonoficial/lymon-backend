export class GetReservationByIdQuery {
  constructor(
    public readonly reservationId: string,
    public readonly tenantId: string,
  ) {}
}
