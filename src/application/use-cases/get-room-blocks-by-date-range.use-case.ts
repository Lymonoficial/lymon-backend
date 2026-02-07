import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type IRoomBlockRepository } from '../../domain/repositories/room-block.repository';
import { RoomBlock } from '../../domain/entities/room-block.entity';
import { GetRoomBlocksDto } from 'src/infrastructure/dtos/get-room-blocks.dto';

@Injectable()
export class GetRoomBlocksByDateRangeUseCase {
  constructor(
    @Inject('IRoomBlockRepository')
    private readonly repository: IRoomBlockRepository,
  ) {}

  async execute(dto: GetRoomBlocksDto): Promise<RoomBlock[]> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    return await this.repository.findByDateRange(startDate, endDate);
  }
}
