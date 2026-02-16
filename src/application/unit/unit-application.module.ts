import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUnitHandler } from '@/application/unit/commands/create-unit.handler';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';

const CommandHandlers = [CreateUnitHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class UnitApplicationModule {}
