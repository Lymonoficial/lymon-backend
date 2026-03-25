import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { SaveGuestEmailHandler } from './commands/save-guest-email.handler';
import { GetGuestEmailsByGuestIdHandler } from './queries/get-guest-emails-by-guest-id/get-guest-emails-by-guest-id.handler';

const CommandHandlers = [SaveGuestEmailHandler];
const QueryHandlers = [GetGuestEmailsByGuestIdHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class GuestEmailApplicationModule {}
