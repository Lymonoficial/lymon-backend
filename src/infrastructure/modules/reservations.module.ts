import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationSchema } from '@/infrastructure/persistence/mongodb/reservations/reservation.schema';
import { ReservationController } from '@/presentation/controllers/reservations/reservation.controller';
import { GetReservationsByDateRangeUseCase } from '@/application/reservations/use-cases/get-reservations-by-date-range.use-case';
import { ReservationRepository } from '@/infrastructure/persistence/mongodb/reservations/reservation.repository';

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
    { provide: 'IReservationRepository', useClass: ReservationRepository },
  ],
})
export class ReservationsModule {}
