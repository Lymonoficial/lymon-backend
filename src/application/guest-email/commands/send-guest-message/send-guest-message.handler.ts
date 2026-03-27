import { Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EMAIL_SERVICE } from '@/application/shared/services/email.service';
import type { IEmailService } from '@/application/shared/services/email.service';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';
import type { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { RESERVATION_REPOSITORY } from '@/domain/reservation/repositories/reservation.repository';
import type { ReservationRepository } from '@/domain/reservation/repositories/reservation.repository';
import { PROPERTY_REPOSITORY } from '@/domain/property/repositories/property.repository';
import type { PropertyRepository } from '@/domain/property/repositories/property.repository';
import { GUEST_EMAIL_REPOSITORY } from '@/domain/guest-email/repositories/guest-email.repository';
import type { GuestEmailRepository } from '@/domain/guest-email/repositories/guest-email.repository';
import { GuestEmail } from '@/domain/guest-email/entities/guest-email.entity';
import { GuestEmailStatusEnum } from '@/domain/guest-email/value-objects/guest-email-status.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { EmailTemplateService } from '@/infrastructure/common/email-template.service';
import { SendGuestMessageCommand } from './send-guest-message.command';

@CommandHandler(SendGuestMessageCommand)
export class SendGuestMessageHandler implements ICommandHandler<SendGuestMessageCommand> {
  constructor(
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(GUEST_EMAIL_REPOSITORY)
    private readonly guestEmailRepository: GuestEmailRepository,
    private readonly templateService: EmailTemplateService,
  ) {}

  async execute(command: SendGuestMessageCommand): Promise<{ id: string }> {
    // 1. Validaciones básicas
    if (!command.body && !command.templateId) {
      throw new BadRequestException('Debe proporcionar un mensaje de texto libre o un ID de plantilla');
    }

    const tenantId = TenantId.createFromString(command.tenantId);
    const guestId = GuestId.createFromString(command.guestId);

    // 2. Obtener datos del huésped
    const guest = await this.guestRepository.findById(guestId);
    if (!guest || !guest.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Huésped no encontrado');
    }

    // 3. Obtener última reserva para variables dinámicas
    const reservations = await this.reservationRepository.findByGuestId(command.tenantId, command.guestId, 1, 1);
    const lastReservation = reservations.length > 0 ? reservations[0] : null;

    let propertyName = 'Lymón Property';
    let checkInDate = 'No disponible';
    let checkOutDate = 'No disponible';

    if (lastReservation) {
      const property = await this.propertyRepository.findById(
        lastReservation.getPropertyId(),
      );
      if (property) {
        propertyName = property.getName();
      }
      checkInDate = lastReservation
        .getDateRange()
        .getCheckIn()
        .toLocaleDateString();
      checkOutDate = lastReservation
        .getDateRange()
        .getCheckOut()
        .toLocaleDateString();
    }

    // 4. Preparar variables para placeholders
    const dynamicVariables = {
      guestName: guest.getFullName(),
      propertyName: propertyName,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      subject: command.subject || '',
      body: command.body || '',
    };

    // Resolver placeholders en asunto y cuerpo de entrada
    const subject = this.templateService.resolvePlaceholders(command.subject || '', dynamicVariables);
    const resolvedBody = this.templateService.resolvePlaceholders(command.body || '', dynamicVariables);

    // 5. Preparar contenido HTML final
    let htmlContent = '';

    if (command.templateId) {
      // Usar plantilla predefinida y resolver variables (incluyendo el cuerpo resuelto)
      const templateName = command.templateId === 'GUEST_WELCOME' ? 'guest-message' : command.templateId;
      htmlContent = this.templateService.renderTemplate(templateName, {
        ...dynamicVariables,
        body: resolvedBody,
        subject: subject,
      });
    } else {
      // Solo texto libre (usar plantilla base muy simple) con variables ya resueltas
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hola ${guest.getFullName()},</h2>
          <div style="line-height: 1.6;">${resolvedBody}</div>
          <hr/>
          <p style="font-size: 0.8em; color: #666;">Enviado por ${propertyName}</p>
        </div>
      `;
    }

    // 5. Enviar Email
    try {
      await this.emailService.sendEmail({
        to: [{ email: guest.getPrimaryEmail(), name: guest.getFullName() }],
        subject: subject,
        htmlContent: htmlContent,
        sender: { name: propertyName, email: 'no-reply@lymon.com.co' }, // Remitente a nombre de la propiedad
        attachments: command.attachments.map(att => ({
          url: att.url,
          name: att.name,
        })),
      });

      // 6. Registrar en el historial
      const guestEmail = GuestEmail.create({
        tenantId,
        guestId,
        subject: subject,
        body: htmlContent,
        status: GuestEmailStatusEnum.SENT,
        attachments: command.attachments,
        sentById: command.sentById,
      });

      await this.guestEmailRepository.save(guestEmail);

      return { id: guestEmail.getId()?.toString() || '' };
    } catch (error) {
      // Registrar como fallido si falla el envío
      const guestEmail = GuestEmail.create({
        tenantId,
        guestId,
        subject: subject,
        body: htmlContent,
        status: GuestEmailStatusEnum.FAILED,
        attachments: command.attachments,
        sentById: command.sentById,
      });
      await this.guestEmailRepository.save(guestEmail);
      
      throw new BadRequestException(`Fallo al enviar el mensaje: ${error.message}`);
    }
  }
}
