import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailTemplateSchema } from '@/infrastructure/persistence/mongodb/emails/email-template.schema';
import { MongooseEmailTemplateRepository } from '@/infrastructure/persistence/mongodb/emails/email-template.repository';
import { CreateEmailTemplateUseCase } from '@/application/emails/use-cases/create-email-template.use-case';
import { UpdateEmailTemplateUseCase } from '@/application/emails/use-cases/update-email-template.use-case';
import { SendEmailUseCase } from '@/application/emails/use-cases/send-email.use-case';
import { GetEmailTemplatesUseCase } from '@/application/emails/use-cases/get-email-templates.use-case';
import { EmailController } from '@/presentation/controllers/emails/email.controller';
import { EmailService } from '@/infrastructure/services/emails/email.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'EmailTemplate', schema: EmailTemplateSchema },
    ]),
  ],
  controllers: [EmailController],
  providers: [
    {
      provide: 'EmailTemplateRepository',
      useClass: MongooseEmailTemplateRepository,
    },
    EmailService,
    CreateEmailTemplateUseCase,
    UpdateEmailTemplateUseCase,
    SendEmailUseCase,
    GetEmailTemplatesUseCase,
  ],
  exports: [EmailService, SendEmailUseCase],
})
export class EmailModule {}
