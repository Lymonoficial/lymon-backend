export class CartReservationItem {
  private constructor(
    readonly tenantId: string,
    readonly reservationId: string,
    readonly totalPriceCopSnapshot: number,
  ) {}

  static create(params: {
    tenantId: string;
    reservationId: string;
    totalPriceCopSnapshot: number;
  }): CartReservationItem {
    return new CartReservationItem(
      params.tenantId,
      params.reservationId,
      params.totalPriceCopSnapshot,
    );
  }
}
