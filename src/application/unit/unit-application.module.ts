import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUnitHandler } from '@/application/unit/commands/create-unit.handler';
import { DeleteUnitHandler } from '@/application/unit/commands/delete-unit.handler';
import { UpdateUnitHandler } from '@/application/unit/commands/update-unit.handler';
import { GetUnitsByPropertyQueryHandler } from '@/application/unit/queries/GetUnitsByProperty/get-units-by-property.query-handler';
import { GetPublicUnitsByTenantQueryHandler } from '@/application/unit/queries/GetPublicUnitsByTenant/get-public-units-by-tenant.query-handler';
import { GetPublicUnitByIdQueryHandler } from '@/application/unit/queries/GetPublicUnitById/get-public-unit-by-id.query-handler';
import { GetAllPublicUnitsQueryHandler } from '@/application/unit/queries/GetAllPublicUnits/get-all-public-units.query-handler';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';

const CommandHandlers = [
  CreateUnitHandler,
  DeleteUnitHandler,
  UpdateUnitHandler,
];
const QueryHandlers = [
  GetUnitsByPropertyQueryHandler,
  GetPublicUnitsByTenantQueryHandler,
  GetPublicUnitByIdQueryHandler,
  GetAllPublicUnitsQueryHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class UnitApplicationModule {}
