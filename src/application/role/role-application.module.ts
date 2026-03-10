import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { GetSystemRolesQueryHandler } from '@/application/role/queries/GetSystemRoles/get-system-roles.query-handler';

const QueryHandlers = [GetSystemRolesQueryHandler];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class RoleApplicationModule {}
