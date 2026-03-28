import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { GuestAuthModule } from '@/infrastructure/guest-auth/guest-auth.module';
import { EmailModule } from '@/infrastructure/email/email.module';
import { RegisterGuestAccountHandler } from '@/application/guest-auth/commands/register-guest-account/register-guest-account.handler';
import { VerifyGuestEmailHandler } from '@/application/guest-auth/commands/verify-guest-email/verify-guest-email.handler';
import { GuestLoginHandler } from '@/application/guest-auth/commands/login-guest/login-guest.handler';
import { RecoverGuestPasswordHandler } from '@/application/guest-auth/commands/recover-guest-password/recover-guest-password.handler';
import { ConfirmRecoverGuestPasswordHandler } from '@/application/guest-auth/commands/confirm-recover-guest-password/confirm-recover-guest-password.handler';
import { ChangeGuestPasswordHandler } from '@/application/guest-auth/commands/change-guest-password/change-guest-password.handler';
import { RefreshGuestTokenHandler } from '@/application/guest-auth/commands/refresh-guest-token/refresh-guest-token.handler';
import { LogoutGuestHandler } from '@/application/guest-auth/commands/logout-guest/logout-guest.handler';

const CommandHandlers = [
  RegisterGuestAccountHandler,
  VerifyGuestEmailHandler,
  GuestLoginHandler,
  RecoverGuestPasswordHandler,
  ConfirmRecoverGuestPasswordHandler,
  ChangeGuestPasswordHandler,
  RefreshGuestTokenHandler,
  LogoutGuestHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule, GuestAuthModule, EmailModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers, GuestAuthModule],
})
export class GuestAuthApplicationModule {}
