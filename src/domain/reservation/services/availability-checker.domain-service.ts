import { DateRange } from '../value-objects/date-range.vo';
import { ReservationStatusEnum } from '../value-objects/reservation-status.vo';
import { Reservation } from '../entities/reservation.entity';

const INACTIVE_STATUSES: ReservationStatusEnum[] = [
  ReservationStatusEnum.CANCELLED,
  ReservationStatusEnum.NO_SHOW,
];

export class AvailabilityChecker {
  static isAvailable(
    requestedRange: DateRange,
    existingReservations: Reservation[],
    inventoryCount: number,
  ): boolean {
    const overlapping = existingReservations.filter((reservation) => {
      if (INACTIVE_STATUSES.includes(reservation.getStatus().getValue()))
        return false;
      return reservation.getDateRange().overlaps(requestedRange);
    });

    return overlapping.length < inventoryCount;
  }
}
