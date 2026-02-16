export class ExternalIds {
  private constructor(
    private readonly airbnbId?: string,
    private readonly bookingId?: string,
    private readonly vrboId?: string,
  ) {}

  static create(
    airbnbId?: string,
    bookingId?: string,
    vrboId?: string,
  ): ExternalIds {
    return new ExternalIds(airbnbId, bookingId, vrboId);
  }

  getAirbnbId(): string | undefined {
    return this.airbnbId;
  }

  getBookingId(): string | undefined {
    return this.bookingId;
  }

  getVrboId(): string | undefined {
    return this.vrboId;
  }

  toObject(): { airbnbId?: string; bookingId?: string; vrboId?: string } {
    return {
      airbnbId: this.airbnbId,
      bookingId: this.bookingId,
      vrboId: this.vrboId,
    };
  }
}
