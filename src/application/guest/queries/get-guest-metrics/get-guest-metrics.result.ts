export class GetGuestMetricsResult {
  constructor(
    public readonly totalBookings: number,
    public readonly totalNights: number,
    public readonly avgNightsPerStay: number,
  ) {}
}