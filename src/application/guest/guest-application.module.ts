import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { SearchGuestsQuery } from './queries/search-guests.query';
import { GetGuestByIdHandler } from './queries/get-guest-by-id/get-guest-by-id.handler';
import { GetGuestBookingsHandler } from './queries/get-guest-bookings/get-guest-bookings.handler';
import { CreateGuestHandler } from '@/application/guest/commands/create-guest.handler';

const CommandHandlers = [CreateGuestHandler];
const QueryHandlers = [
  SearchGuestsQuery,
  GetGuestByIdHandler,
  GetGuestBookingsHandler,
];

@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
  ],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class GuestApplicationModule {}
