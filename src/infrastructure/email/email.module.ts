import { EMAIL_SERVICE } from '@/application/tenant/commands/register-tenant.handler';
import { Module } from '@nestjs/common';
import { EmailService } from '@/infrastructure/email/email.service';

@Module({
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: EmailService,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
