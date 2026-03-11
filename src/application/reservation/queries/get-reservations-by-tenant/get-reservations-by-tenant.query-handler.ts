import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReservationsByTenantQuery } from './get-reservations-by-tenant.query';
import { GetReservationsByTenantResult } from './get-reservations-by-tenant.result';
import { toReservationDto } from '../shared/reservation.mapper';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';

@QueryHandler(GetReservationsByTenantQuery)
export class GetReservationsByTenantHandler implements IQueryHandler<
  GetReservationsByTenantQuery,
  GetReservationsByTenantResult
> {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute(
    query: GetReservationsByTenantQuery,
  ): Promise<GetReservationsByTenantResult> {
    const [reservations, total] = await Promise.all([
      this.reservationRepository.findByTenantId(
        query.tenantId,
        query.page,
        query.limit,
      ),
      this.reservationRepository.countByTenantId(query.tenantId),
    ]);

    return new GetReservationsByTenantResult(
      reservations.map(toReservationDto),
      total,
      query.page,
      query.limit,
    );
  }
}
