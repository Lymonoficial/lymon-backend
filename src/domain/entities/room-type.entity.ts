export class RoomType {
  constructor(
    public readonly id: string,
    public readonly hotelId: string,
    public name: string,
    public description: string,
    public basePrice: number,
    public maxOccupancy: number,
    public amenities: string[],
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    hotelId: string;
    name: string;
    description: string;
    basePrice: number;
    maxOccupancy: number;
    amenities?: string[];
  }): RoomType {
    if (params.basePrice < 0) {
      throw new Error('Base price cannot be negative');
    }

    if (params.maxOccupancy < 1) {
      throw new Error('Max occupancy must be at least 1');
    }

    return new RoomType(
      params.id,
      params.hotelId,
      params.name,
      params.description,
      params.basePrice,
      params.maxOccupancy,
      params.amenities || [],
      new Date(),
    );
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    this.basePrice = newPrice;
  }

  addAmenity(amenity: string): void {
    if (!this.amenities.includes(amenity)) {
      this.amenities.push(amenity);
    }
  }
}
