import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { EmailTemplateRepository } from '@/domain/emails/repositories/email-template.repository';
import { UpdateEmailTemplateDto } from '@/infrastructure/emails/dtos/update-email-template.dto';
import { EmailTemplate } from '@/domain/emails/entities/email-template.entity';

@Injectable()
export class UpdateEmailTemplateUseCase {
  constructor(
    @Inject('EmailTemplateRepository')
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  async execute(
    templateId: string,
    dto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const template = await this.emailTemplateRepository.findById(templateId);

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    if (dto.subject && dto.body) {
      template.updateTemplate(dto.subject, dto.body);
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        template.activate();
      } else {
        template.deactivate();
      }
    }

    await this.emailTemplateRepository.update(templateId, {
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
      updatedAt: template.updatedAt,
    });

    return template;
  }
}
