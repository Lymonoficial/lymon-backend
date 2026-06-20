export class GetGuestMetricsResult {
  constructor(
    public readonly totalBookings: number,
    public readonly totalNights: number,
    public readonly avgNightsPerStay: number,
    public readonly averageBookingValue: number,
    public readonly lastStayAt: string | null,
    public readonly daysSinceLastStay: number | null,
  ) {}
}