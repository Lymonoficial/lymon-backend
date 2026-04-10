import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePropertyHandler } from '@/application/property/commands/create-property.handler';
import { UpdatePropertyHandler } from '@/application/property/commands/update-property.handler';
import { DeletePropertyHandler } from '@/application/property/commands/delete-property.handler';
import { GetPropertiesByTenantQueryHandler } from '@/application/property/queries/GetPropertiesByTenant/get-properties-by-tenant.query-handler';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';

const CommandHandlers = [
  CreatePropertyHandler,
  UpdatePropertyHandler,
  DeletePropertyHandler,
];
const QueryHandlers = [GetPropertiesByTenantQueryHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class PropertyApplicationModule {}
