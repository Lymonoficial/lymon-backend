import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MarkNoShowCommand } from './mark-no-show.command';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';

@CommandHandler(MarkNoShowCommand)
export class MarkNoShowHandler implements ICommandHandler<MarkNoShowCommand> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: MarkNoShowCommand): Promise<void> {
    const id = ReservationId.create(command.reservationId);
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.getTenantId().toString() !== command.tenantId) {
      throw new NotFoundException('Reservation not found');
    }

    try {
      reservation.markNoShow();
    } catch {
      throw new BadRequestException(
        'Cannot mark no-show for reservation in its current state',
      );
    }

    await this.reservationRepository.save(reservation);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.RESERVATION_NO_SHOW,
        AuditEntityType.RESERVATION,
        command.reservationId,
      ),
    );
  }
}
