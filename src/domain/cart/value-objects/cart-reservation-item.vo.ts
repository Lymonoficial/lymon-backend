export class CartReservationItem {
  private constructor(
    readonly reservationId: string,
    readonly totalPriceCopSnapshot: number,
  ) {}

  static create(params: {
    reservationId: string;
    totalPriceCopSnapshot: number;
  }): CartReservationItem {
    return new CartReservationItem(
      params.reservationId,
      params.totalPriceCopSnapshot,
    );
  }
}
