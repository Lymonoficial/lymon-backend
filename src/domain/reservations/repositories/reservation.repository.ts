import { Reservation } from '../reservations/entities/reservation.entity';

export interface IReservationRepository {
  findByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]>;
}
