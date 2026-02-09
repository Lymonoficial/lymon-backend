import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { RoomRepository } from '@/domain/rooms/repositories/room.repository';
import type { RoomTypeRepository } from '@/domain/rooms/repositories/room-type.repository';
import { AssignRoomUnitsDto } from '@/presentation/dtos/rooms/assign-room-units.dto';
import { Room } from '@/domain/rooms/entities/room.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class AssignRoomUnitsUseCase {
  constructor(
    @Inject('RoomRepository')
    private readonly roomRepository: RoomRepository,
    @Inject('RoomTypeRepository')
    private readonly roomTypeRepository: RoomTypeRepository,
  ) {}

  async execute(dto: AssignRoomUnitsDto): Promise<Room[]> {
    // Verify that room type exists
    const roomType = await this.roomTypeRepository.findById(dto.roomTypeId);
    if (!roomType) {
      throw new BadRequestException('Room type not found');
    }

    // Verify room type belongs to the specified hotel
    if (roomType.hotelId !== dto.hotelId) {
      throw new BadRequestException(
        'Room type does not belong to the specified hotel',
      );
    }

    // Check for duplicate room numbers in the request
    const roomNumbers = dto.rooms.map((r) => r.roomNumber);
    const uniqueRoomNumbers = new Set(roomNumbers);
    if (roomNumbers.length !== uniqueRoomNumbers.size) {
      throw new BadRequestException('Duplicate room numbers in the request');
    }

    // Check if any room number already exists for this hotel
    for (const roomUnit of dto.rooms) {
      const existingRoom = await this.roomRepository.findByRoomNumber(
        dto.hotelId,
        roomUnit.roomNumber,
      );
      if (existingRoom) {
        throw new BadRequestException(
          `Room number ${roomUnit.roomNumber} already exists in this hotel`,
        );
      }
    }

    // Create room entities
    const rooms = dto.rooms.map((roomUnit) =>
      Room.create({
        id: randomUUID(),
        roomTypeId: dto.roomTypeId,
        hotelId: dto.hotelId,
        roomNumber: roomUnit.roomNumber,
        name: `Habitación ${roomUnit.roomNumber}`, // Nombre por defecto
        floor: roomUnit.floor,
        basePrice: 0, // Precio por defecto, puede ser actualizado posteriormente
      }),
    );

    // Save all rooms
    const roomsData = rooms.map((room) => ({
      id: room.id,
      roomTypeId: room.roomTypeId,
      hotelId: room.hotelId,
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      basePrice: room.basePrice,
      createdAt: room.createdAt,
    }));

    return await this.roomRepository.saveMany(roomsData);
  }
}
