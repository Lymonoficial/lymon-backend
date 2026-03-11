import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CheckOutCommand } from './check-out.command';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import {
  TRANSACTION_MANAGER,
  type TransactionManager,
} from '@/domain/shared/transaction-manager.interface';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';

@CommandHandler(CheckOutCommand)
export class CheckOutHandler implements ICommandHandler<CheckOutCommand> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: TransactionManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CheckOutCommand): Promise<void> {
    const id = ReservationId.create(command.reservationId);
    const reservation = await this.reservationRepository.findById(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.getTenantId().toString() !== command.tenantId) {
      throw new NotFoundException('Reservation not found');
    }

    const checkOutActualAt = command.actualAt ?? new Date();

    try {
      reservation.checkOut(checkOutActualAt);
    } catch {
      throw new BadRequestException(
        'Cannot check out reservation in its current state',
      );
    }

    const guestId = GuestId.createFromString(
      reservation.getGuestId().toString(),
    );
    const guest = await this.guestRepository.findById(guestId);

    if (guest) {
      const current = guest.getSummary();
      const nights = reservation.getDateRange().nights();

      guest.updateCrmSummary({
        totalBookings: current.totalBookings + 1,
        totalNights: current.totalNights + nights,
        totalSpend: current.totalSpend + reservation.getTotalPrice(),
        lastStayAt: checkOutActualAt,
        lastPropertyId: PropertyId.create(
          reservation.getPropertyId().toString(),
        ),
        lastUnitId: UnitId.create(reservation.getUnitId().toString()),
      });

      await this.transactionManager.executeInTransaction(async (context) => {
        await this.reservationRepository.save(
          reservation,
          context.getContext(),
        );
        await this.guestRepository.save(guest, context.getContext());
      });
    } else {
      await this.reservationRepository.save(reservation);
    }

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.RESERVATION_CHECKED_OUT,
        AuditEntityType.RESERVATION,
        command.reservationId,
      ),
    );
  }
}
