import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { SearchGuestsQuery } from './queries/search-guests.query';
import { CreateGuestHandler } from '@/application/guest/commands/create-guest.handler';

const CommandHandlers = [CreateGuestHandler];
const QueryHandlers = [SearchGuestsQuery];

@Module({
  imports: [
    CqrsModule,
    PersistenceModule, // Esto es necesario para que el módulo encuentre el GUEST_REPOSITORY
  ],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class GuestApplicationModule {}
