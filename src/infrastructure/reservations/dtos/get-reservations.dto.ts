import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ReservationStatus } from 'src/domain/reservations/entities/reservation.entity';

export class GetReservationsDto {
  @ApiProperty({
    example: '2026-02-01',
    description: 'Start date for filtering reservations yy-mm-dd',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-02-28',
    description: 'End date for filtering reservations yy-mm-dd',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    required: false,
    enum: ReservationStatus,
    description: 'Optional filter by reservation status',
  })
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;
}
