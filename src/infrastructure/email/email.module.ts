import { EMAIL_SERVICE } from '@/application/shared/services/email.service';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrevoEmailService } from './services/brevo-email.service';
import { EmailTemplateService } from '@/infrastructure/common/email-template.service';
import { GuestEmailCreatedListener } from './listeners/guest-email-created.listener';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [ConfigModule, forwardRef(() => PersistenceModule)],
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: BrevoEmailService,
    },
    EmailTemplateService,
    GuestEmailCreatedListener,
  ],
  exports: [EMAIL_SERVICE, EmailTemplateService],
})
export class EmailModule {}
