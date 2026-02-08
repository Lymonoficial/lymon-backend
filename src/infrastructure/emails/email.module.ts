import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailTemplateSchema } from '@/infrastructure/emails/persistence/mongoose/schemas/email-template.schema';
import { MongooseEmailTemplateRepository } from '@/infrastructure/emails/persistence/mongoose/repositories/email-template.repository';
import { CreateEmailTemplateUseCase } from '@/application/emails/use-cases/create-email-template.use-case';
import { UpdateEmailTemplateUseCase } from '@/application/emails/use-cases/update-email-template.use-case';
import { SendEmailUseCase } from '@/application/emails/use-cases/send-email.use-case';
import { GetEmailTemplatesUseCase } from '@/application/emails/use-cases/get-email-templates.use-case';
import { EmailController } from '@/infrastructure/emails/controllers/email.controller';
import { EmailService } from '@/infrastructure/emails/services/email.service';

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
