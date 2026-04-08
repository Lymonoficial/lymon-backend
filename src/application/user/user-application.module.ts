import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { GetStaffByTenantHandler } from './queries/get-staff-by-tenant/get-staff-by-tenant.handler';

const QueryHandlers = [GetStaffByTenantHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class UserApplicationModule {}
