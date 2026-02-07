import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RoomBlock, RoomBlockStatus } from 'src/domain/rooms/entities/room-block.entity';
import { type IRoomBlockRepository } from 'src/domain/rooms/repositories/room-block.repository';
import { CreateRoomBlockDto } from 'src/infrastructure/rooms/dtos/create-room-block.dto';

@Injectable()
export class CreateRoomBlockUseCase {
  constructor(
    @Inject('IRoomBlockRepository')
    private readonly repository: IRoomBlockRepository,
  ) {}

  async execute(dto: CreateRoomBlockDto): Promise<RoomBlock> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const cutoffDate = dto.cutoffDate ? new Date(dto.cutoffDate) : null;

    // Validate dates
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (cutoffDate && cutoffDate >= startDate) {
      throw new BadRequestException(
        'Cutoff date must be before start date',
      );
    }

    // Check for duplicate room numbers in the array
    const uniqueRoomNumbers = new Set(dto.roomNumbers);
    if (uniqueRoomNumbers.size !== dto.roomNumbers.length) {
      throw new BadRequestException(
        'Duplicate room numbers are not allowed in the same block',
      );
    }

    // Check for conflicting blocks (same rooms in active blocks for overlapping dates)
    const conflictingBlocks = await this.repository.findConflictingBlocks(
      dto.roomNumbers,
      startDate,
      endDate,
    );

    if (conflictingBlocks.length > 0) {
      const conflictDetails = conflictingBlocks.map(
        (block) =>
          `"${block.blockName}" (rooms: ${block.roomNumbers.filter((rn) => dto.roomNumbers.includes(rn)).join(', ')})`,
      );
      throw new BadRequestException(
        `Cannot create block. The following rooms are already blocked: ${conflictDetails.join('; ')}`,
      );
    }

    // Create room block entity
    const roomBlock = {
      blockName: dto.blockName,
      companyName: dto.companyName || null,
      eventName: dto.eventName || null,
      roomNumbers: dto.roomNumbers,
      startDate,
      endDate,
      status: RoomBlockStatus.ACTIVE,
      createdBy: dto.createdBy,
      notes: dto.notes || null,
      numberOfRooms: dto.roomNumbers.length,
      cutoffDate,
    };

    return await this.repository.save(roomBlock);
  }
}
