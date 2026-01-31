import { Injectable, Inject } from '@nestjs/common';
import type { EmailTemplateRepository } from 'src/domain/repositories/email-template.repository';
import { EmailTemplate } from 'src/domain/entities/email-template.entity';

@Injectable()
export class GetEmailTemplatesUseCase {
  constructor(
    @Inject('EmailTemplateRepository')
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  async execute(hotelId: string): Promise<EmailTemplate[]> {
    return await this.emailTemplateRepository.findAllByHotelId(hotelId);
  }
}
