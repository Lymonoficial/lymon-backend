import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReservationsByUnitQuery } from './get-reservations-by-unit.query';
import { ReservationDto } from '../shared/reservation.dto';
import { toReservationDto } from '../shared/reservation.mapper';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { DateRange } from '@/domain/reservation/value-objects/date-range.vo';

@QueryHandler(GetReservationsByUnitQuery)
export class GetReservationsByUnitHandler implements IQueryHandler<
  GetReservationsByUnitQuery,
  ReservationDto[]
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(query: GetReservationsByUnitQuery): Promise<ReservationDto[]> {
    const unitId = UnitId.create(query.unitId);

    if (query.startDate && query.endDate) {
      let dateRange: DateRange;
      try {
        dateRange = DateRange.create(query.startDate, query.endDate);
      } catch {
        return [];
      }
      const reservations =
        await this.reservationRepository.findByUnitAndDateRange(
          unitId,
          dateRange,
        );
      return reservations
        .filter((r) => r.getTenantId().toString() === query.tenantId)
        .map(toReservationDto);
    }

    const reservations = await this.reservationRepository.findByUnitId(
      query.tenantId,
      query.unitId,
      1,
      100,
    );
    return reservations.map(toReservationDto);
  }
}
