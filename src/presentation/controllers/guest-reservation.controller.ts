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
import { GuestReservationDetailResult } from '@/application/reservation/queries/get-guest-reservation/get-guest-reservation.result';
import { GetGuestReservationsQuery } from '@/application/reservation/queries/get-guest-reservations/get-guest-reservations.query';
import { GetGuestReservationsResult } from '@/application/reservation/queries/get-guest-reservations/get-guest-reservations.result';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';

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
  @ApiOperation({ summary: 'List authenticated guest bookings' })
  @ApiResponse({ status: 200, description: 'Paginated guest bookings list' })
  async findAll(
    @CurrentGuest() guest: GuestJwtPayload,
    @Query()
    query: {
      page?: string;
      limit?: string;
      status?: string;
      fromDate?: string;
      toDate?: string;
      sortBy?: 'date' | 'status' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<GetGuestReservationsResult> {
    const parsedStatus = this.parseStatus(query.status);
    const sortBy = query.sortBy ?? 'date';
    const sortOrder = query.sortOrder ?? 'desc';

    return this.queryBus.execute<
      GetGuestReservationsQuery,
      GetGuestReservationsResult
    >(
      new GetGuestReservationsQuery(
        guest.guestAccountId,
        Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1),
        Math.max(1, Number.parseInt(query.limit ?? '20', 10) || 20),
        parsedStatus,
        query.fromDate ? new Date(query.fromDate) : undefined,
        query.toDate ? new Date(query.toDate) : undefined,
        sortBy,
        sortOrder,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a guest reservation by ID' })
  @ApiResponse({ status: 200, description: 'Reservation detail for guest' })
  async findOne(
    @CurrentGuest() guest: GuestJwtPayload,
    @Param('id') id: string,
  ): Promise<GuestReservationDetailResult> {
    return this.queryBus.execute<
      GetGuestReservationQuery,
      GuestReservationDetailResult
    >(new GetGuestReservationQuery(id, guest.guestAccountId));
  }

  private parseStatus(status?: string): ReservationStatusEnum | undefined {
    if (!status) {
      return undefined;
    }

    const normalized = status.toLowerCase();
    const statusMap: Record<string, ReservationStatusEnum> = {
      pending: ReservationStatusEnum.PENDING,
      confirmed: ReservationStatusEnum.CONFIRMED,
      cancelled: ReservationStatusEnum.CANCELLED,
      completed: ReservationStatusEnum.CHECKED_OUT,
    };

    return statusMap[normalized];
  }
}
