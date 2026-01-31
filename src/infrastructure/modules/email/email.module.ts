import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailTemplateSchema } from 'src/infrastructure/persistence/mongoose/email-template.schema';
import { MongooseEmailTemplateRepository } from 'src/infrastructure/persistence/mongoose/repositories/email-template.repository';
import { CreateEmailTemplateUseCase } from 'src/application/use-cases/create-email-template.use-case';
import { UpdateEmailTemplateUseCase } from 'src/application/use-cases/update-email-template.use-case';
import { SendEmailUseCase } from 'src/application/use-cases/send-email.use-case';
import { GetEmailTemplatesUseCase } from 'src/application/use-cases/get-email-templates.use-case';
import { EmailController } from 'src/infrastructure/controllers/email/email.controller';
import { EmailService } from 'src/application/services/email.service';

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
