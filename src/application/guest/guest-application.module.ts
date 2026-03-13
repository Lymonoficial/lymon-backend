import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { SearchGuestsQuery } from './queries/search-guests.query';

const QueryHandlers = [SearchGuestsQuery];

@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
  ],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class GuestApplicationModule {}