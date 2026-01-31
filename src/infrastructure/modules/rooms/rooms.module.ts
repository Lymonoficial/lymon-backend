import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateRoomTypeUseCase } from 'src/application/use-cases/create-room-type.use-case';
import { AssignRoomUnitsUseCase } from 'src/application/use-cases/assign-room-units.use-case';
import { CreateRoomUseCase } from 'src/application/use-cases/create-room.use-case';
import { UpdateRoomPriceUseCase } from 'src/application/use-cases/update-room-price.use-case';
import { CreateSpecialPriceUseCase } from 'src/application/use-cases/create-special-price.use-case';
import { RoomController } from 'src/infrastructure/controllers/rooms/room.controller';
import { RoomTypeSchema } from 'src/infrastructure/persistence/mongoose/room-type.schema';
import { RoomSchema } from 'src/infrastructure/persistence/mongoose/room.schema';
import { SpecialPriceSchema } from 'src/infrastructure/persistence/mongoose/special-price.schema';
import { MongooseRoomTypeRepository } from 'src/infrastructure/persistence/mongoose/repositories/room-type.repository';
import { MongooseRoomRepository } from 'src/infrastructure/persistence/mongoose/repositories/room.repository';
import { MongooseSpecialPriceRepository } from 'src/infrastructure/persistence/mongoose/repositories/special-price.repository';

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
