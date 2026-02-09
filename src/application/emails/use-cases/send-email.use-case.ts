import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { EmailTemplateRepository } from '@/domain/emails/repositories/email-template.repository';
import { SendEmailDto } from '@/presentation/dtos/emails/send-email.dto';
import { EmailService } from '@/infrastructure/services/emails/email.service';

@Injectable()
export class SendEmailUseCase {
  constructor(
    @Inject('EmailTemplateRepository')
    private readonly emailTemplateRepository: EmailTemplateRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(dto: SendEmailDto): Promise<boolean> {
    // Buscar la plantilla activa
    const template = await this.emailTemplateRepository.findByHotelIdAndType(
      dto.hotelId,
      dto.templateType,
    );

    if (!template) {
      throw new NotFoundException(
        `No active email template found for type: ${dto.templateType}`,
      );
    }

    // Renderizar el asunto y el cuerpo con las variables
    const renderedSubject = template.renderSubject(dto.variables);
    const renderedBody = template.renderBody(dto.variables);

    // Enviar el correo
    return await this.emailService.sendEmail({
      to: dto.to,
      subject: renderedSubject,
      html: renderedBody,
    });
  }
}
