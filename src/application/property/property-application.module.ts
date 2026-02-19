import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePropertyHandler } from '@/application/property/commands/create-property.handler';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';

const CommandHandlers = [CreatePropertyHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class PropertyApplicationModule {}
