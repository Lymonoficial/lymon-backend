import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationSchema } from '../../persistence/mongoose/reservation.schema';
import { ReservationController } from '../../controllers/reservation/reservation.controller';
import { GetReservationsByDateRangeUseCase } from '../../../application/use-cases/get-reservations-by-date-range.use-case';
import { ReservationRepository } from '../../persistence/mongoose/repositories/reservation.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { 
        name: 'Reservation', 
        schema: ReservationSchema,
      },
    ]),
  ],
  controllers: [ReservationController],
  providers: [
    GetReservationsByDateRangeUseCase,
    { provide: 'IReservationRepository', useClass: ReservationRepository,},
  ],
})
export class ReservationsModule {}
