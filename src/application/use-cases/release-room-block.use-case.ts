import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type IRoomBlockRepository } from '../../domain/repositories/room-block.repository';
import { RoomBlock, RoomBlockStatus } from '../../domain/entities/room-block.entity';

@Injectable()
export class ReleaseRoomBlockUseCase {
  constructor(
    @Inject('IRoomBlockRepository')
    private readonly repository: IRoomBlockRepository,
  ) {}

  async execute(id: string): Promise<RoomBlock> {
    const roomBlock = await this.repository.findById(id);

    if (!roomBlock) {
      throw new NotFoundException(`Room block with ID ${id} not found`);
    }

    if (roomBlock.status !== RoomBlockStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot release block with status "${roomBlock.status}". Only active blocks can be released.`,
      );
    }

    return await this.repository.updateStatus(id, RoomBlockStatus.RELEASED);
  }
}
