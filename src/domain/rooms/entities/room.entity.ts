export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

export class Room {
  constructor(
    public readonly id: string,
    public readonly roomTypeId: string,
    public readonly hotelId: string,
    public roomNumber: string,
    public name: string, // Nombre descriptivo de la habitación
    public floor: number,
    public status: RoomStatus,
    public basePrice: number, // Precio base por noche
    public image?: string, // URL de la imagen
    public amenities?: string[], // Servicios incluidos: ['WiFi', 'TV', 'Aire acondicionado']
    public description?: string, // Descripción de la habitación
    public readonly createdAt?: Date,
  ) {}

  static create(params: {
    id: string;
    roomTypeId: string;
    hotelId: string;
    roomNumber: string;
    name: string;
    floor: number;
    basePrice: number;
    image?: string;
    amenities?: string[];
    description?: string;
  }): Room {
    if (params.floor < 0) {
      throw new Error('Floor number cannot be negative');
    }

    if (params.basePrice < 0) {
      throw new Error('Base price cannot be negative');
    }

    return new Room(
      params.id,
      params.roomTypeId,
      params.hotelId,
      params.roomNumber,
      params.name,
      params.floor,
      RoomStatus.AVAILABLE,
      params.basePrice,
      params.image,
      params.amenities || [],
      params.description,
      new Date(),
    );
  }

  changeStatus(newStatus: RoomStatus): void {
    this.status = newStatus;
  }

  isAvailable(): boolean {
    return this.status === RoomStatus.AVAILABLE;
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    this.basePrice = newPrice;
  }
}
