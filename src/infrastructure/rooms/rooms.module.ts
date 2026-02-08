import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateRoomTypeUseCase } from '@/application/rooms/use-cases/create-room-type.use-case';
import { AssignRoomUnitsUseCase } from '@/application/rooms/use-cases/assign-room-units.use-case';
import { CreateRoomUseCase } from '@/application/rooms/use-cases/create-room.use-case';
import { UpdateRoomPriceUseCase } from '@/application/rooms/use-cases/update-room-price.use-case';
import { CreateSpecialPriceUseCase } from '@/application/rooms/use-cases/create-special-price.use-case';
import { RoomController } from '@/infrastructure/rooms/controllers/room.controller';
import { RoomTypeSchema } from '@/infrastructure/rooms/persistence/mongoose/schemas/room-type.schema';
import { RoomSchema } from '@/infrastructure/rooms/persistence/mongoose/schemas/room.schema';
import { SpecialPriceSchema } from '@/infrastructure/rooms/persistence/mongoose/schemas/special-price.schema';
import { MongooseRoomTypeRepository } from '@/infrastructure/rooms/persistence/mongoose/repositories/room-type.repository';
import { MongooseRoomRepository } from '@/infrastructure/rooms/persistence/mongoose/repositories/room.repository';
import { MongooseSpecialPriceRepository } from '@/infrastructure/rooms/persistence/mongoose/repositories/special-price.repository';

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
