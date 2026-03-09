import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { UpdateTenantProfileHandler } from '@/application/tenant/commands/update-tenant-profile.handler';
import { GetTenantProfileQueryHandler } from '@/application/tenant/queries/GetTenantProfile/get-tenant-profile.query-handler';

const CommandHandlers = [UpdateTenantProfileHandler];
const QueryHandlers = [GetTenantProfileQueryHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class TenantApplicationModule {}
