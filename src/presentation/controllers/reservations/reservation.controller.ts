import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetReservationsByDateRangeUseCase } from '@/application/reservations/use-cases/get-reservations-by-date-range.use-case';
import { GetReservationsDto } from '@/presentation/dtos/reservations/get-reservations.dto';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly getReservationsByDateRangeUseCase: GetReservationsByDateRangeUseCase,
  ) {}

  @Get('gantt')
  @ApiOperation({
    summary: 'Get reservations for Gantt board visualization',
    description:
      'Retrieve all reservations within a date range for guest check-in/check-out management',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservations retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range or parameters',
  })
  async getGanttData(@Query() query: GetReservationsDto) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    return await this.getReservationsByDateRangeUseCase.execute(query);
  }
}
