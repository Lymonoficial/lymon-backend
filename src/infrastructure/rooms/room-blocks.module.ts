import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomBlockSchema } from '../rooms/persistence/mongoose/room-block.schema';
import { RoomBlockController } from '../rooms/controllers/room-block.controller';
import { RoomBlockRepository } from '../rooms/persistence/mongoose/room-block.repository';
import { CreateRoomBlockUseCase } from 'src/application/rooms/use-cases/create-room-block.use-case';
import { GetRoomBlocksByDateRangeUseCase } from 'src/application/rooms/use-cases/get-room-blocks-by-date-range.use-case';
import { ReleaseRoomBlockUseCase } from 'src/application/rooms/use-cases/release-room-block.use-case';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'RoomBlock', schema: RoomBlockSchema },
    ]),
  ],
  controllers: [RoomBlockController],
  providers: [
    CreateRoomBlockUseCase,
    GetRoomBlocksByDateRangeUseCase,
    ReleaseRoomBlockUseCase,
    {
      provide: 'IRoomBlockRepository',
      useClass: RoomBlockRepository,
    },
  ],
  exports: ['IRoomBlockRepository'],
})
export class RoomBlocksModule {}
