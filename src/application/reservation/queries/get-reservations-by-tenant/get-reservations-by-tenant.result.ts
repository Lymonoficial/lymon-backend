import { ReservationDto } from '../shared/reservation.dto';

export class GetReservationsByTenantResult {
  constructor(
    public readonly items: ReservationDto[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
