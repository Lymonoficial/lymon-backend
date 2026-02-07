import { Reservation } from '../entities/reservation.entity';

export interface IReservationRepository {
  findByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]>;
}
