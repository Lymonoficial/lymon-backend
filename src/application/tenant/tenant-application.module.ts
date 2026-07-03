import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { StorageModule } from '@/infrastructure/storage/storage.module';
import { UpdateTenantProfileHandler } from '@/application/tenant/commands/update-tenant-profile.handler';
import { SetTenantLogoHandler } from '@/application/tenant/commands/set-tenant-logo/set-tenant-logo.handler';
import { GetTenantProfileQueryHandler } from '@/application/tenant/queries/GetTenantProfile/get-tenant-profile.query-handler';
import { GenerateTenantLogoUrlQueryHandler } from '@/application/tenant/queries/generate-tenant-logo-url/generate-tenant-logo-url.query-handler';
import { DeleteTenantHandler } from './commands/delete-tenant/delete-tenant.handler';

const CommandHandlers = [
  UpdateTenantProfileHandler,
  SetTenantLogoHandler,
  DeleteTenantHandler,
];
const QueryHandlers = [
  GetTenantProfileQueryHandler,
  GenerateTenantLogoUrlQueryHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule, StorageModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class TenantApplicationModule {}
