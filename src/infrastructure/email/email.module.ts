import { EMAIL_SERVICE } from '@/application/shared/services/email.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrevoEmailService } from './services/brevo-email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_SERVICE,
      useClass: BrevoEmailService,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
