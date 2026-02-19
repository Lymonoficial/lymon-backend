export class Location {
  private constructor(
    private readonly lat: number,
    private readonly lng: number,
  ) {}

  static create(lat: number, lng: number): Location {
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    return new Location(lat, lng);
  }

  getLat(): number {
    return this.lat;
  }

  getLng(): number {
    return this.lng;
  }

  toObject(): { lat: number; lng: number } {
    return {
      lat: this.lat,
      lng: this.lng,
    };
  }
}
