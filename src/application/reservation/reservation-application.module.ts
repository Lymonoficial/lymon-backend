import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { CreateReservationHandler } from './commands/create-reservation/create-reservation.handler';
import { ConfirmReservationHandler } from './commands/confirm-reservation/confirm-reservation.handler';
import { CancelReservationHandler } from './commands/cancel-reservation/cancel-reservation.handler';
import { CheckInHandler } from './commands/check-in/check-in.handler';
import { CheckOutHandler } from './commands/check-out/check-out.handler';
import { MarkNoShowHandler } from './commands/mark-no-show/mark-no-show.handler';
import { UpdateReservationHandler } from './commands/update-reservation/update-reservation.handler';
import { GetReservationByIdHandler } from './queries/get-reservation-by-id/get-reservation-by-id.query-handler';
import { GetReservationsByTenantHandler } from './queries/get-reservations-by-tenant/get-reservations-by-tenant.query-handler';
import { GetReservationsByUnitHandler } from './queries/get-reservations-by-unit/get-reservations-by-unit.query-handler';

const CommandHandlers = [
  CreateReservationHandler,
  ConfirmReservationHandler,
  CancelReservationHandler,
  CheckInHandler,
  CheckOutHandler,
  MarkNoShowHandler,
  UpdateReservationHandler,
];

const QueryHandlers = [
  GetReservationByIdHandler,
  GetReservationsByTenantHandler,
  GetReservationsByUnitHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class ReservationApplicationModule {}
