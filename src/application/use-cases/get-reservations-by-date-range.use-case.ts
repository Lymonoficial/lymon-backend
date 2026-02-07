import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type IReservationRepository } from '../../domain/repositories/reservation.repository';
import { Reservation } from '../../domain/entities/reservation.entity';
import { GetReservationsDto } from '../../infrastructure/dtos/get-reservations.dto';

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
      throw new BadRequestException(
        'Start date must be before end date',
      );
    }

    return await this.repository.findByDateRange(startDate, endDate);
  }
}
