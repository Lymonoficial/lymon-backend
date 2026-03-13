import {
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateReservationCommand } from './update-reservation.command';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import {
  UNIT_REPOSITORY,
  type UnitRepository,
} from '@/domain/unit/repositories/unit.repository';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { DateRange } from '@/domain/reservation/value-objects/date-range.vo';
import { AvailabilityChecker } from '@/domain/reservation/services/availability-checker.domain-service';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';

@CommandHandler(UpdateReservationCommand)
export class UpdateReservationHandler implements ICommandHandler<UpdateReservationCommand> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateReservationCommand): Promise<void> {
    const id = ReservationId.create(command.reservationId);
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.getTenantId().toString() !== command.tenantId) {
      throw new NotFoundException('Reservation not found');
    }

    if (command.checkIn !== null || command.checkOut !== null) {
      const newCheckIn =
        command.checkIn ?? reservation.getDateRange().getCheckIn();
      const newCheckOut =
        command.checkOut ?? reservation.getDateRange().getCheckOut();

      let newDateRange: DateRange;
      try {
        newDateRange = DateRange.create(newCheckIn, newCheckOut);
      } catch {
        throw new BadRequestException('checkOut must be after checkIn');
      }

      const unitId = UnitId.create(reservation.getUnitId().toString());
      const unit = await this.unitRepository.findById(unitId);
      if (!unit) {
        throw new NotFoundException('Unit not found');
      }

      const existing = await this.reservationRepository.findByUnitAndDateRange(
        unitId,
        newDateRange,
      );

      // Exclude the current reservation from availability check
      const others = existing.filter(
        (reservation) =>
          reservation.getId()?.toString() !== command.reservationId,
      );

      if (
        !AvailabilityChecker.isAvailable(
          newDateRange,
          others,
          unit.getInventoryCount(),
        )
      ) {
        throw new ConflictException(
          'Unit is not available for the requested dates',
        );
      }

      reservation.updateDates(newDateRange);
    }

    if (command.notes !== null) {
      reservation.updateNotes(command.notes);
    }

    await this.reservationRepository.save(reservation);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.RESERVATION_UPDATED,
        AuditEntityType.RESERVATION,
        command.reservationId,
      ),
    );
  }
}
