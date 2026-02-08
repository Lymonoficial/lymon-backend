export class SpecialPrice {
  constructor(
    public readonly id: string,
    public readonly roomId: string,
    public readonly hotelId: string,
    public startDate: Date,
    public endDate: Date,
    public price: number,
    public description?: string,
    public readonly createdAt?: Date,
  ) {}

  static create(params: {
    id: string;
    roomId: string;
    hotelId: string;
    startDate: Date;
    endDate: Date;
    price: number;
    description?: string;
  }): SpecialPrice {
    if (params.price < 0) {
      throw new Error('Price cannot be negative');
    }

    if (params.startDate >= params.endDate) {
      throw new Error('Start date must be before end date');
    }

    return new SpecialPrice(
      params.id,
      params.roomId,
      params.hotelId,
      params.startDate,
      params.endDate,
      params.price,
      params.description,
      new Date(),
    );
  }

  isActiveForDate(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}
