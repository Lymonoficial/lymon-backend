import { ProcessChannexBookingCommand } from './process-channex-booking.command';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import {
  UNIT_REPOSITORY,
  type UnitRepository,
} from '@/domain/unit/repositories/unit.repository';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { Reservation } from '@/domain/reservation/entities/reservation.entity';
import { DateRange } from '@/domain/reservation/value-objects/date-range.vo';
import {
  ReservationSource,
  ReservationSourceEnum,
} from '@/domain/reservation/value-objects/reservation-source.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { Guest } from '@/domain/guest/entities/guest.entity';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AuditLoggedEvent,
  AUDIT_LOG_EVENT,
} from '@/infrastructure/audit/events/audit-logged.event';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@CommandHandler(ProcessChannexBookingCommand)
export class ProcessChannexBookingHandler
  implements ICommandHandler<ProcessChannexBookingCommand, void>
{
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ProcessChannexBookingCommand): Promise<void> {
    const property = await this.propertyRepository.findByChannexId(
      command.propertyChannexId,
    );
    if (!property) {
      throw new NotFoundException(
        `Property not found for channexId: ${command.propertyChannexId}`,
      );
    }

    const unit = await this.unitRepository.findByChannexRoomTypeId(
      command.roomTypeId,
    );
    if (!unit) {
      throw new NotFoundException(
        `Unit not found for channex room_type_id: ${command.roomTypeId}`,
      );
    }

    const existing = await this.reservationRepository.findByExternalId(
      ReservationSourceEnum.BOOKING,
      command.externalId,
    );
    if (existing) return;

    const tenantId = property.getTenantId();

    const guestId = await this.resolveGuestId(tenantId, {
      firstName: command.customerFirstName,
      lastName: command.customerLastName,
      email: command.customerEmail,
      phone: command.customerPhone,
    });

    const checkIn = new Date(command.arrivalDate);
    const checkOut = new Date(command.departureDate);
    const dateRange = DateRange.reconstitute(checkIn, checkOut);
    const nights = dateRange.nights();
    const pricePerNight =
      nights > 0 ? command.totalAmount / nights : command.totalAmount;

    const reservation = Reservation.createConfirmed({
      tenantId,
      propertyId: property.getId()!,
      unitId: UnitId.create(unit.getId()!.toString()),
      guestId,
      dateRange,
      source: ReservationSource.create(ReservationSourceEnum.BOOKING),
      guestsCount: command.guestsCount,
      pricePerNight,
      externalReservationId: command.externalId,
    });

    const reservationId = await this.reservationRepository.save(reservation);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        tenantId.toString(),
        'channex-system',
        'channex@system',
        AuditAction.RESERVATION_CREATED,
        AuditEntityType.RESERVATION,
        reservationId,
        { externalId: command.externalId, bookingId: command.bookingId },
      ),
    );
  }

  private async resolveGuestId(
    tenantId: TenantId,
    customer: { firstName: string; lastName: string; email: string; phone: string },
  ): Promise<GuestId> {
    const existing = await this.guestRepository.findByPrimaryEmail(
      tenantId,
      customer.email,
    );
    if (existing) return existing.getId()!;

    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const guest = Guest.create({
      tenantId,
      identity: {},
      fullName: fullName || customer.email,
      primaryEmail: customer.email,
      firstName: customer.firstName || undefined,
      lastName: customer.lastName || undefined,
      phones: customer.phone
        ? [{ number: customer.phone, isPrimary: true }]
        : [],
    });

    const savedId = await this.guestRepository.save(guest);
    return GuestId.createFromString(savedId);
  }
}
