import {
  CHANNEX_SERVICE,
} from '@/application/shared/services/channex.service';
import type {
  IChannexService,
  ChannexAvailabilityEntry,
} from '@/application/shared/services/channex.service';
import {
  CHANNEX_AVAILABILITY_UPDATE_EVENT,
  ChannexAvailabilityUpdateEvent,
} from '@/infrastructure/channex/events/channex-availability-update.event';
import {
  UNIT_REPOSITORY,
} from '@/domain/unit/repositories/unit.repository';
import type { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import {
  PROPERTY_REPOSITORY,
} from '@/domain/property/repositories/property.repository';
import type { PropertyRepository } from '@/domain/property/repositories/property.repository';
import {
  RESERVATION_REPOSITORY,
} from '@/domain/reservation/repositories/reservation.repository';
import type { ReservationRepository } from '@/domain/reservation/repositories/reservation.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { DateRange } from '@/domain/reservation/value-objects/date-range.vo';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChannexAvailabilityUpdateListener {
  private readonly logger = new Logger(ChannexAvailabilityUpdateListener.name);

  constructor(
    @Inject(CHANNEX_SERVICE)
    private readonly channexService: IChannexService,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  @OnEvent(CHANNEX_AVAILABILITY_UPDATE_EVENT)
  async handleAvailabilityUpdate(
    event: ChannexAvailabilityUpdateEvent,
  ): Promise<void> {
    const unitId = UnitId.create(event.unitId);
    const unit = await this.unitRepository.findById(unitId);
    if (!unit) return;

    const roomTypeId = unit.getChannexRoomTypeId();
    if (!roomTypeId) return;

    const property = await this.propertyRepository.findById(unit.getPropertyId());
    const propertyChannexId = property?.getChannexId();
    if (!propertyChannexId) return;

    const dateRange = DateRange.reconstitute(event.checkIn, event.checkOut);
    const reservations = await this.reservationRepository.findByUnitAndDateRange(
      unitId,
      dateRange,
    );

    const activeStatuses = new Set([
      ReservationStatusEnum.PENDING,
      ReservationStatusEnum.CONFIRMED,
      ReservationStatusEnum.CHECKED_IN,
    ]);

    const activeReservations = reservations.filter((r) =>
      activeStatuses.has(r.getStatus().getValue()),
    );

    const entries: ChannexAvailabilityEntry[] = [];
    const current = new Date(event.checkIn);
    current.setUTCHours(0, 0, 0, 0);
    const end = new Date(event.checkOut);
    end.setUTCHours(0, 0, 0, 0);

    while (current < end) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

      const overlapping = activeReservations.filter((r) => {
        const checkIn = r.getDateRange().getCheckIn();
        const checkOut = r.getDateRange().getCheckOut();
        return checkIn < dayEnd && checkOut > dayStart;
      });

      const available = Math.max(
        0,
        unit.getInventoryCount() - overlapping.length,
      );

      entries.push({
        date: current.toISOString().slice(0, 10),
        availability: available,
      });

      current.setUTCDate(current.getUTCDate() + 1);
    }

    try {
      await this.channexService.updateAvailability(
        propertyChannexId,
        roomTypeId,
        entries,
      );
      this.logger.log(
        `[CHANNEX] Availability updated for unit ${event.unitId} (${entries.length} dates)`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `[CHANNEX] Failed to update availability for unit ${event.unitId}: ${message}`,
      );
    }
  }
}
