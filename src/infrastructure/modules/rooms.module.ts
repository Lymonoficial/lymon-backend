import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateRoomTypeUseCase } from '@/application/rooms/use-cases/create-room-type.use-case';
import { AssignRoomUnitsUseCase } from '@/application/rooms/use-cases/assign-room-units.use-case';
import { CreateRoomUseCase } from '@/application/rooms/use-cases/create-room.use-case';
import { UpdateRoomPriceUseCase } from '@/application/rooms/use-cases/update-room-price.use-case';
import { CreateSpecialPriceUseCase } from '@/application/rooms/use-cases/create-special-price.use-case';
import { RoomController } from '@/presentation/controllers/rooms/room.controller';
import { RoomTypeSchema } from '@/infrastructure/persistence/mongodb/rooms/room-type.schema';
import { RoomSchema } from '@/infrastructure/persistence/mongodb/rooms/room.schema';
import { SpecialPriceSchema } from '@/infrastructure/persistence/mongodb/rooms/special-price.schema';
import { MongooseRoomTypeRepository } from '@/infrastructure/persistence/mongodb/rooms/room-type.repository';
import { MongooseRoomRepository } from '@/infrastructure/persistence/mongodb/rooms/room.repository';
import { MongooseSpecialPriceRepository } from '@/infrastructure/persistence/mongodb/rooms/special-price.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'RoomType',
        schema: RoomTypeSchema,
      },
      {
        name: 'Room',
        schema: RoomSchema,
      },
      {
        name: 'SpecialPrice',
        schema: SpecialPriceSchema,
      },
    ]),
  ],
  controllers: [RoomController],
  providers: [
    CreateRoomTypeUseCase,
    AssignRoomUnitsUseCase,
    CreateRoomUseCase,
    UpdateRoomPriceUseCase,
    CreateSpecialPriceUseCase,
    {
      provide: 'RoomTypeRepository',
      useClass: MongooseRoomTypeRepository,
    },
    {
      provide: 'RoomRepository',
      useClass: MongooseRoomRepository,
    },
    {
      provide: 'SpecialPriceRepository',
      useClass: MongooseSpecialPriceRepository,
    },
  ],
  exports: ['RoomTypeRepository', 'RoomRepository', 'SpecialPriceRepository'],
})
export class RoomsModule {}
