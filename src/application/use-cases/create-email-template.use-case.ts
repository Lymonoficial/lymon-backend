import { Injectable, Inject } from '@nestjs/common';
import type { EmailTemplateRepository } from 'src/domain/repositories/email-template.repository';
import { CreateEmailTemplateDto } from 'src/infrastructure/dtos/create-email-template.dto';
import { EmailTemplate } from 'src/domain/entities/email-template.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateEmailTemplateUseCase {
  constructor(
    @Inject('EmailTemplateRepository')
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  async execute(dto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const templateId = randomUUID();

    const template = EmailTemplate.create({
      id: templateId,
      hotelId: dto.hotelId,
      type: dto.type,
      subject: dto.subject,
      body: dto.body,
      isActive: dto.isActive,
    });

    return await this.emailTemplateRepository.save(template);
  }
}
