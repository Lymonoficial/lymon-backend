import { EMAIL_SERVICE } from '@/application/shared/services/email.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrevoEmailService } from './services/brevo-email.service';
import { EmailTemplateService } from '@/infrastructure/common/email-template.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: BrevoEmailService,
    },
    EmailTemplateService,
  ],
  exports: [EMAIL_SERVICE, EmailTemplateService],
})
export class EmailModule {}
