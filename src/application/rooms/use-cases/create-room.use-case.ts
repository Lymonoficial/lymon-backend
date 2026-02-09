import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { RoomRepository } from '@/domain/rooms/repositories/room.repository';
import { CreateRoomDto } from '@/presentation/dtos/rooms/create-room.dto';
import { Room } from '@/domain/rooms/entities/room.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject('RoomRepository')
    private readonly roomRepository: RoomRepository,
  ) {}

  async execute(dto: CreateRoomDto): Promise<Room> {
    // Generate room ID
    const roomId = randomUUID();

    // Create room entity
    const room = Room.create({
      id: roomId,
      roomTypeId: dto.roomTypeId,
      hotelId: dto.hotelId,
      roomNumber: dto.roomNumber,
      name: dto.name,
      floor: dto.floor,
      image: dto.image,
      amenities: dto.amenities,
      description: dto.description,
      basePrice: dto.basePrice,
    });

    // Save room
    try {
      const savedRoom = await this.roomRepository.save(room);
      return savedRoom;
    } catch (error) {
      throw new BadRequestException(
        'No se pudo crear la habitación. Verifica que el número de habitación no esté duplicado.',
      );
    }
  }
}
