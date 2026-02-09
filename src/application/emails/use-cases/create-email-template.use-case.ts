import { Injectable, Inject } from '@nestjs/common';
import type { EmailTemplateRepository } from '@/domain/emails/repositories/email-template.repository';
import { CreateEmailTemplateDto } from '@/presentation/dtos/emails/create-email-template.dto';
import { EmailTemplate } from '@/domain/emails/entities/email-template.entity';
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
