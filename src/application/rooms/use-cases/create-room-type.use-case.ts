import { Injectable, Inject } from '@nestjs/common';
import type { RoomTypeRepository } from '@/domain/rooms/repositories/room-type.repository';
import { CreateRoomTypeDto } from '@/presentation/dtos/rooms/create-room-type.dto';
import { RoomType } from '@/domain/rooms/entities/room-type.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateRoomTypeUseCase {
  constructor(
    @Inject('RoomTypeRepository')
    private readonly roomTypeRepository: RoomTypeRepository,
  ) {}

  async execute(dto: CreateRoomTypeDto): Promise<RoomType> {
    const roomType = RoomType.create({
      id: randomUUID(),
      hotelId: dto.hotelId,
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      maxOccupancy: dto.maxOccupancy,
      amenities: dto.amenities,
    });

    return await this.roomTypeRepository.save({
      id: roomType.id,
      hotelId: roomType.hotelId,
      name: roomType.name,
      description: roomType.description,
      basePrice: roomType.basePrice,
      maxOccupancy: roomType.maxOccupancy,
      amenities: roomType.amenities,
      createdAt: roomType.createdAt,
    });
  }
}
