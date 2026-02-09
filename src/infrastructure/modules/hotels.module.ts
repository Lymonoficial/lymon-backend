import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegisterHotelUseCase } from '@/application/hotels/use-cases/register-hotel.use-case';
import { HotelController } from '@/presentation/controllers/hotels/hotel.controller';
import { HotelSchema } from '@/infrastructure/persistence/mongodb/hotels/hotel.schema';
import { MongooseHotelRepository } from '@/infrastructure/persistence/mongodb/hotels/hotel.repository';

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
