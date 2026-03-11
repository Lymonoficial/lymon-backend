import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { SearchGuestsQuery } from './queries/search-guests.query';
import { SearchGuestByIdQuery } from './queries/search-guests-by-id.query';
import { CreateGuestHandler } from '@/application/guest/commands/create-guest.handler';

const CommandHandlers = [CreateGuestHandler];
const QueryHandlers = [SearchGuestsQuery, SearchGuestByIdQuery];

@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
  ],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class GuestApplicationModule {}
