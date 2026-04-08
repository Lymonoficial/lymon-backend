import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { CreateReservationHandler } from './commands/create-reservation/create-reservation.handler';
import { CreateGuestReservationHandler } from '@/application/reservation/commands/create-guest-reservation/create-guest-reservation.handler';
import { ConfirmReservationHandler } from '@/application/reservation/commands/confirm-reservation/confirm-reservation.handler';
import { CancelReservationHandler } from '@/application/reservation/commands/cancel-reservation/cancel-reservation.handler';
import { CheckInHandler } from '@/application/reservation/commands/check-in/check-in.handler';
import { CheckOutHandler } from '@/application/reservation/commands/check-out/check-out.handler';
import { MarkNoShowHandler } from '@/application/reservation/commands/mark-no-show/mark-no-show.handler';
import { UpdateReservationHandler } from '@/application/reservation/commands/update-reservation/update-reservation.handler';
import { GetReservationByIdHandler } from '@/application/reservation/queries/get-reservation-by-id/get-reservation-by-id.query-handler';
import { GetReservationsByTenantHandler } from '@/application/reservation/queries/get-reservations-by-tenant/get-reservations-by-tenant.query-handler';
import { GetReservationsByUnitHandler } from '@/application/reservation/queries/get-reservations-by-unit/get-reservations-by-unit.query-handler';
import { GetGuestReservationHandler } from '@/application/reservation/queries/get-guest-reservation/get-guest-reservation.query-handler';
import { GetGuestReservationsHandler } from '@/application/reservation/queries/get-guest-reservations/get-guest-reservations.query-handler';

const CommandHandlers = [
  CreateReservationHandler,
  CreateGuestReservationHandler,
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
  GetGuestReservationHandler,
  GetGuestReservationsHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class ReservationApplicationModule {}
