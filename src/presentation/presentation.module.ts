import { ApplicationModule } from '@/application/application.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from '@/presentation/controllers/auth.controller';
import { UserController } from '@/presentation/controllers/user.controller';
import { PropertyController } from '@/presentation/controllers/property.controller';
import { UnitController } from '@/presentation/controllers/unit.controller';
import { AuditController } from '@/presentation/controllers/audit.controller';

@Module({
  imports: [CqrsModule, ApplicationModule],
  controllers: [
    AuthController,
    UserController,
    PropertyController,
    UnitController,
    AuditController,
  ],
})
export class PresentationModule {}
