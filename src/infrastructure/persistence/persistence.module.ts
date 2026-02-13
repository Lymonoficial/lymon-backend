import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TenantDocument,
  TenantSchema,
} from '@/infrastructure/persistence/schemas/tenant.schema';
import {
  UserDocument,
  UserSchema,
} from '@/infrastructure/persistence/schemas/user.schema';
import { TENANT_REPOSITORY } from '@/domain/tenant/repositories/tenant.repository';
import { MongoTenantRepository } from '@/infrastructure/persistence/repositories/mongo-tenant.repository';
import { USER_REPOSITORY } from '@/domain/user/repositories/user.repository';
import { MongoUserRepository } from '@/infrastructure/persistence/repositories/mongo-user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantDocument.name, schema: TenantSchema },
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  providers: [
    {
      provide: TENANT_REPOSITORY,
      useClass: MongoTenantRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
  ],
  exports: [TENANT_REPOSITORY, USER_REPOSITORY],
})
export class PersistenceModule {}
