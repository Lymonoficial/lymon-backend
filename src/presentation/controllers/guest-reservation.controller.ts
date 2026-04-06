import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { GuestJwtAuthGuard } from '@/infrastructure/guest-auth/guards/guest-jwt-auth.guard';
import { CurrentGuest } from '@/infrastructure/guest-auth/decorators/current-guest.decorator';
import { type GuestJwtPayload } from '@/application/guest-auth/services/guest-jwt.service';
import { CreateGuestReservationDto } from '@/presentation/dtos/create-guest-reservation.dto';
import { CreateGuestReservationCommand } from '@/application/reservation/commands/create-guest-reservation/create-guest-reservation.command';
import { CreateReservationResult } from '@/application/reservation/commands/create-reservation/create-reservation.result';
import { GetGuestReservationQuery } from '@/application/reservation/queries/get-guest-reservation/get-guest-reservation.query';
import { GetReservationsByGuestIdQuery } from '@/application/reservation/queries/get-reservations-by-guest-id/get-reservations-by-guest-id.query';
import { GetReservationsByGuestIdResult } from '@/application/reservation/queries/get-reservations-by-guest-id/get-reservations-by-guest-id.result';
import { ReservationDto } from '@/application/reservation/queries/shared/reservation.dto';

@ApiTags('guest-reservations')
@ApiBearerAuth('GuestJWT-auth')
@Public()
@UseGuards(GuestJwtAuthGuard)
@Controller('guest/reservations')
export class GuestReservationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a reservation as a guest' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  async create(
    @CurrentGuest() guest: GuestJwtPayload,
    @Body() dto: CreateGuestReservationDto,
  ) {
    const result = await this.commandBus.execute<
      CreateGuestReservationCommand,
      CreateReservationResult
    >(
      new CreateGuestReservationCommand(
        dto.tenantId,
        guest.guestAccountId,
        guest.email,
        dto.propertyId,
        dto.unitId,
        new Date(dto.checkIn),
        new Date(dto.checkOut),
        dto.guestsCount,
        dto.notes ?? null,
      ),
    );

    return {
      message: 'Reservation created successfully',
      reservationId: result.reservationId,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all reservations for the authenticated guest' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Reservations retrieved successfully' })
  async findByGuest(
    @CurrentGuest() guest: GuestJwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.queryBus.execute<
      GetReservationsByGuestIdQuery,
      GetReservationsByGuestIdResult
    >(new GetReservationsByGuestIdQuery(guest.guestAccountId, page, limit));

    return {
      message: 'Reservations retrieved successfully',
      data: {
        items: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a guest reservation by ID' })
  @ApiResponse({ status: 200, type: ReservationDto })
  async findOne(
    @CurrentGuest() guest: GuestJwtPayload,
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ): Promise<ReservationDto> {
    return this.queryBus.execute<GetGuestReservationQuery, ReservationDto>(
      new GetGuestReservationQuery(id, tenantId, guest.guestAccountId),
    );
  }
}
