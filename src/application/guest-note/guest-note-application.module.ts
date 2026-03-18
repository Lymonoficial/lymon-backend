import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { CreateGuestNoteHandler } from '@/application/guest-note/commands/create-guest-note.handler';

const CommandHandlers = [CreateGuestNoteHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class GuestNoteApplicationModule {}
