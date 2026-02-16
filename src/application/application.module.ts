import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterTenantHandler } from '@/application/tenant/commands/register-tenant.handler';
import { VerifyEmailHandler } from '@/application/user/commands/verify-email.handler';
import { ChangePasswordHandler } from '@/application/user/commands/change-password.handler';
import { AuthModule } from '@/infrastructure/auth/auth.module';
import { LoginHandler } from './auth/commands/login.handler';
import { EmailModule } from '@/infrastructure/email/email.module';

const CommandHandlers = [
  RegisterTenantHandler,
  LoginHandler,
  VerifyEmailHandler,
  ChangePasswordHandler,
];
@Module({
  imports: [CqrsModule, PersistenceModule, AuthModule, EmailModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ApplicationModule {}
