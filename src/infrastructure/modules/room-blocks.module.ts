import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomBlockSchema } from '@/infrastructure/persistence/mongodb/rooms/room-block.schema';
import { RoomBlockController } from '@/presentation/controllers/rooms/room-block.controller';
import { CreateRoomBlockUseCase } from '@/application/rooms/use-cases/create-room-block.use-case';
import { GetRoomBlocksByDateRangeUseCase } from '@/application/rooms/use-cases/get-room-blocks-by-date-range.use-case';
import { ReleaseRoomBlockUseCase } from '@/application/rooms/use-cases/release-room-block.use-case';
import { RoomBlockRepository } from '@/infrastructure/persistence/mongodb/rooms/room-block.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'RoomBlock', schema: RoomBlockSchema }]),
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
