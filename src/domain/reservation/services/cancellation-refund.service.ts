export class CancellationRefundService {
  static calculate(
    checkInDate: Date,
    cancellationDate: Date,
    totalPrice: number,
  ): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysUntilCheckIn = Math.floor(
      (checkInDate.getTime() - cancellationDate.getTime()) / msPerDay,
    );

    if (daysUntilCheckIn >= 7) return totalPrice;
    if (daysUntilCheckIn >= 3) return Math.round(totalPrice * 0.5);
    return 0;
  }
}
