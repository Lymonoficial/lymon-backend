import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { SearchGuestsQuery } from './queries/search-guests.query';

const QueryHandlers = [SearchGuestsQuery];

@Module({
  imports: [
    CqrsModule,
    PersistenceModule, // Esto es necesario para que el módulo encuentre el GUEST_REPOSITORY
  ],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class GuestApplicationModule {}