import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { EmailTemplateService } from '@/infrastructure/common/email-template.service';
import { SendGuestMessageCommand } from './send-guest-message.command';
import { GuestEmailCreatedEvent } from '../../events/guest-email-created.event';

@CommandHandler(SendGuestMessageCommand)
export class SendGuestMessageHandler implements ICommandHandler<SendGuestMessageCommand> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(GUEST_EMAIL_REPOSITORY)
    private readonly guestEmailRepository: GuestEmailRepository,
    private readonly templateService: EmailTemplateService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: SendGuestMessageCommand): Promise<{ id: string }> {
    if (!command.body && !command.templateId) {
      throw new BadRequestException(
        'Debe proporcionar un mensaje de texto libre o un ID de plantilla',
      );
    }

    const tenantId = TenantId.createFromString(command.tenantId);
    const guestId = GuestId.createFromString(command.guestId);

    const guest = await this.guestRepository.findById(guestId);
    if (!guest?.getTenantId()?.equals?.(tenantId)) {
      throw new NotFoundException('Huésped no encontrado');
    }

    const reservations = await this.reservationRepository.findByGuestId(
      command.tenantId,
      command.guestId,
      1,
      1,
    );
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

    const dynamicVariables = {
      guestName: guest.getFullName(),
      propertyName: propertyName,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      subject: command.subject || '',
      body: command.body || '',
    };

    const subject = this.templateService.resolvePlaceholders(
      command.subject || '',
      dynamicVariables,
    );
    const resolvedBody = this.templateService.resolvePlaceholders(
      command.body || '',
      dynamicVariables,
    );

    let htmlContent = '';
    if (command.templateId) {
      const templateName =
        command.templateId === 'GUEST_WELCOME'
          ? 'guest-message'
          : command.templateId;
      htmlContent = this.templateService.renderTemplate(templateName, {
        ...dynamicVariables,
        body: resolvedBody,
        subject: subject,
      });
    } else {
      htmlContent = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Hola ${guest.getFullName()},</h2>
          <div style="line-height: 1.6;">${resolvedBody}</div>
          <hr/>
          <p style="font-size: 0.8em; color: #666;">Enviado por ${propertyName}</p>
        </div>
      `;
    }

    const guestEmail = GuestEmail.create({
      tenantId,
      guestId,
      subject: subject,
      status: GuestEmailStatusEnum.PENDING,
      attachments: command.attachments,
      sentById: command.sentById,
    });

    await this.guestEmailRepository.save(guestEmail);

    // Pasamos el NOMBRE DE LA PROPIEDAD como remitente visual
    this.eventEmitter.emit(
      'guest-email.created',
      new GuestEmailCreatedEvent(
        guestEmail.getId().toString(),
        subject,
        htmlContent,
        propertyName,
      ),
    );

    return { id: guestEmail.getId().toString() };
  }
}
