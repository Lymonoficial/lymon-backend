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
import {
  PropertyDocument,
  PropertySchema,
} from '@/infrastructure/persistence/schemas/property.schema';
import {
  UnitDocument,
  UnitSchema,
} from '@/infrastructure/persistence/schemas/unit.schema';
import { TENANT_REPOSITORY } from '@/domain/tenant/repositories/tenant.repository';
import { MongoTenantRepository } from '@/infrastructure/persistence/repositories/mongo-tenant.repository';
import { USER_REPOSITORY } from '@/domain/user/repositories/user.repository';
import { MongoUserRepository } from '@/infrastructure/persistence/repositories/mongo-user.repository';
import { PROPERTY_REPOSITORY } from '@/domain/property/repositories/property.repository';
import { MongoPropertyRepository } from '@/infrastructure/persistence/repositories/mongo-property.repository';
import { UNIT_REPOSITORY } from '@/domain/unit/repositories/unit.repository';
import { MongoUnitRepository } from '@/infrastructure/persistence/repositories/mongo-unit.repository';
import { TRANSACTION_MANAGER } from '@/domain/shared/transaction-manager.interface';
import { MongoTransactionManager } from '@/infrastructure/persistence/transaction/mongo-transaction-manager';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantDocument.name, schema: TenantSchema },
      { name: UserDocument.name, schema: UserSchema },
      { name: PropertyDocument.name, schema: PropertySchema },
      { name: UnitDocument.name, schema: UnitSchema },
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
    {
      provide: PROPERTY_REPOSITORY,
      useClass: MongoPropertyRepository,
    },
    {
      provide: UNIT_REPOSITORY,
      useClass: MongoUnitRepository,
    },
    {
      provide: TRANSACTION_MANAGER,
      useClass: MongoTransactionManager,
    },
  ],
  exports: [
    TENANT_REPOSITORY,
    USER_REPOSITORY,
    PROPERTY_REPOSITORY,
    UNIT_REPOSITORY,
    TRANSACTION_MANAGER,
  ],
})
export class PersistenceModule {}
