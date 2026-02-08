import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Reservation } from '@/domain/reservations/entities/reservation.entity';
import { type IReservationRepository } from '@/domain/reservations/repositories/reservation.repository';
import { GetReservationsDto } from '@/infrastructure/reservations/dtos/get-reservations.dto';

@Injectable()
export class GetReservationsByDateRangeUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly repository: IReservationRepository,
  ) {}

  async execute(dto: GetReservationsDto): Promise<Reservation[]> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    return await this.repository.findByDateRange(startDate, endDate);
  }
}
