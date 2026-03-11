import { Module } from '@nestjs/common';
import { ReservationCheckInScheduler } from './schedulers/reservation-checkin.scheduler';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [ReservationCheckInScheduler],
})
export class ReservationInfrastructureModule {}
