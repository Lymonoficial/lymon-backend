import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegisterHotelUseCase } from 'src/application/use-cases/register-hotel.use-case';
import { HotelController } from 'src/infrastructure/controllers/hotel/hotel.controller';
import { HotelSchema } from 'src/infrastructure/persistence/mongoose/hotel.schema';
import { MongooseHotelRepository } from 'src/infrastructure/persistence/mongoose/repositories/hotel.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Hotel',
        schema: HotelSchema,
      },
    ]),
  ],
  controllers: [HotelController],
  providers: [
    RegisterHotelUseCase,
    {
      provide: 'HotelRepository',
      useClass: MongooseHotelRepository,
    },
  ],
  exports: ['HotelRepository'],
})
export class HotelsModule {}
