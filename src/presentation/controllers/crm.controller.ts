import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { SearchGuestsQuery } from '@/application/guest/queries/search-guests.query';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Post, Body, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateGuestNoteCommand } from '@/application/guest-note/commands/create-guest-note.command';
import { CreateGuestNoteDto } from '@/presentation/dtos/create-guest-note.dto';
import { GetGuestBookingsQuery } from '@/application/guest/queries/get-guest-bookings/get-guest-bookings.query';
import { GetGuestBookingsResult } from '@/application/guest/queries/get-guest-bookings/get-guest-bookings.result';

@ApiTags('crm')
@ApiBearerAuth('JWT-auth')
@Controller('crm')
export class CrmController {
  constructor(
    private readonly searchGuestsQuery: SearchGuestsQuery,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('guests')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_VIEW)
  @ApiOperation({
    summary: 'List all tenant guests for CRM ordered by creation date desc',
  })
  @ApiResponse({
    status: 200,
    description: 'CRM guests retrieved successfully',
  })
  async getGuests(@CurrentUser() user: JwtPayload) {
    const guests = await this.searchGuestsQuery.execute(
      TenantId.createFromString(user.tenantId),
      '',
    );

    return {
      message: 'CRM guests retrieved successfully',
      data: guests.map((guest) => ({
        fullName: guest.getFullName(),
        primaryEmail: guest.getPrimaryEmail(),
        phones: guest.getPhones(),
        status: guest.getStatus(),
        tags: guest.getTags(),
      })),
      total: guests.length,
    };
  }

  @Post('guests/:guestId/notes')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({
    summary: 'Add internal note to a guest',
  })
  @ApiResponse({
    status: 201,
    description: 'Internal note added successfully',
  })
  async addGuestNote(
    @Param('guestId') guestId: string,
    @Body() dto: CreateGuestNoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.commandBus.execute(
      new CreateGuestNoteCommand(
        user.tenantId,
        guestId,
        dto.note,
        dto.type,
        user.userId,
        dto.status,
      ),
    );

    return {
      message: 'Internal note added successfully',
      data: result,
    };
  }

  @Get('guests/:guestId/bookings')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_VIEW)
  @ApiOperation({
    summary: 'Get reservation history for a guest',
  })
  @ApiResponse({
    status: 200,
    description: 'Guest bookings retrieved successfully',
  })
  async getGuestBookings(
    @Param('guestId') guestId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.queryBus.execute<
      GetGuestBookingsQuery,
      GetGuestBookingsResult
    >(new GetGuestBookingsQuery(user.tenantId, guestId));

    return {
      message: 'Guest bookings retrieved successfully',
      data: result.items,
    };
  }
}
