import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUnitHandler } from '@/application/unit/commands/create-unit.handler';
import { GetUnitsByPropertyQueryHandler } from '@/application/unit/queries/GetUnitsByProperty/get-units-by-property.query-handler';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';

const CommandHandlers = [CreateUnitHandler];
const QueryHandlers = [GetUnitsByPropertyQueryHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class UnitApplicationModule {}
