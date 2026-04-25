import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { CreateExperienceHandler } from '@/application/experience/commands/create-experience.handler';

const CommandHandlers = [CreateExperienceHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ExperienceApplicationModule {}
