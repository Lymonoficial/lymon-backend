import { Injectable, Inject } from '@nestjs/common';
import type { EmailTemplateRepository } from '@/domain/emails/repositories/email-template.repository';
import { EmailTemplate } from '@/domain/emails/entities/email-template.entity';

@Injectable()
export class GetEmailTemplatesUseCase {
  constructor(
    @Inject('EmailTemplateRepository')
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) { }

  async execute(hotelId: string): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.findAllByHotelId(hotelId);
  }
}
