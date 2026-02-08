import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { RoomRepository } from 'src/domain/repositories/room.repository';
import { UpdateRoomPriceDto } from 'src/infrastructure/dtos/update-room-price.dto';

@Injectable()
export class UpdateRoomPriceUseCase {
  constructor(
    @Inject('RoomRepository')
    private readonly roomRepository: RoomRepository,
  ) {}

  async execute(roomId: string, dto: UpdateRoomPriceDto) {
    const room = await this.roomRepository.findById(roomId);

    if (!room) {
      throw new BadRequestException('Habitación no encontrada');
    }

    room.updatePrice(dto.basePrice);

    await this.roomRepository.update(roomId, { basePrice: dto.basePrice });

    return {
      id: room.id,
      roomNumber: room.roomNumber,
      name: room.name,
      basePrice: room.basePrice,
      message: 'Precio actualizado exitosamente',
    };
  }
}
