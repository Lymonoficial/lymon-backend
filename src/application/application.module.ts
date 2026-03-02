import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterTenantHandler } from '@/application/tenant/commands/register-tenant.handler';
import { VerifyEmailHandler } from '@/application/user/commands/verify-email/verify-email.handler';
import { ChangePasswordHandler } from '@/application/user/commands/change-password/change-password.handler';
import { AuthModule } from '@/infrastructure/auth/auth.module';
import { LoginHandler } from './auth/commands/login.handler';
import { RecoverPasswordHandler } from './auth/commands/recover-password.handler';
import { ConfirmRecoverPasswordHandler } from './auth/commands/confirm-recover-password.handler';
import { EmailModule } from '@/infrastructure/email/email.module';
import { PropertyApplicationModule } from '@/application/property/property-application.module';
import { UnitApplicationModule } from '@/application/unit/unit-application.module';
import { InviteStaffHandler } from '@/application/user/commands/invite-staff/invite-staff.handler';
import { AuditApplicationModule } from '@/application/audit/audit-application.module';

const CommandHandlers = [
  RegisterTenantHandler,
  LoginHandler,
  RecoverPasswordHandler,
  ConfirmRecoverPasswordHandler,
  VerifyEmailHandler,
  ChangePasswordHandler,
  InviteStaffHandler,
];
@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
    AuthModule,
    EmailModule,
    PropertyApplicationModule,
    UnitApplicationModule,
    AuditApplicationModule,
  ],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ApplicationModule {}
