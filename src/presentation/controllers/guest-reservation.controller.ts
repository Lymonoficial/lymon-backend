import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
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
