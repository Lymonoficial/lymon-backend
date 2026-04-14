import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { SearchGuestsQuery } from '@/application/guest/queries/search-guests.query';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignGuestTagsCommand } from '@/application/guest/commands/assign-guest-tags.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateGuestNoteCommand } from '@/application/guest-note/commands/create-guest-note.command';
import { CreateGuestNoteResult } from '@/application/guest-note/commands/create-guest-note.result';
import { CreateGuestNoteDto } from '@/presentation/dtos/create-guest-note.dto';
import { GetGuestBookingsQuery } from '@/application/guest/queries/get-guest-bookings/get-guest-bookings.query';
import { GetGuestBookingsResult } from '@/application/guest/queries/get-guest-bookings/get-guest-bookings.result';
import { GetGuestNotesByGuestIdQuery } from '@/application/guest-note/queries/get-guest-notes-by-guest-id/get-guest-notes-by-guest-id.query';
import { GetGuestNotesByGuestIdResult } from '@/application/guest-note/queries/get-guest-notes-by-guest-id/get-guest-notes-by-guest-id.result';
import { GetGuestEmailsByGuestIdQuery } from '@/application/guest-email/queries/get-guest-emails-by-guest-id/get-guest-emails-by-guest-id.query';
import { GetGuestEmailsByGuestIdResult } from '@/application/guest-email/queries/get-guest-emails-by-guest-id/get-guest-emails-by-guest-id.result';
import { SendGuestMessageCommand } from '@/application/guest-email/commands/send-guest-message/send-guest-message.command';
import { SendGuestMessageDto } from '@/presentation/dtos/send-guest-message.dto';
import { SaveGuestPreferencesCommand } from '@/application/guest/commands/preferences/save-guest-preferences.command';
import { SaveGuestPreferencesResult } from '@/application/guest/commands/preferences/save-guest-preferences.result';
import { SaveGuestPreferencesDto } from '@/presentation/dtos/save-guest-preferences.dto';

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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'fullName', 'status'],
  })
  @ApiQuery({ name: 'sortDirection', required: false, enum: ['asc', 'desc'] })
  async getGuests(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy: 'createdAt' | 'fullName' | 'status' = 'createdAt',
    @Query('sortDirection') sortDirection: 'asc' | 'desc' = 'desc',
  ) {
    const { guests, total } = await this.searchGuestsQuery.execute(
      TenantId.createFromString(user.tenantId),
      '',
      page,
      limit,
      sortBy,
      sortDirection,
    );

    return {
      message: 'CRM guests retrieved successfully',
      data: {
        items: guests.map((guest) => ({
          guestId: guest.getId()?.toString(),
          fullName: guest.getFullName(),
          primaryEmail: guest.getPrimaryEmail(),
          phones: guest.getPhones(),
          status: guest.getStatus(),
          tags: guest.getTags(),
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
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
    const result = await this.commandBus.execute<
      CreateGuestNoteCommand,
      CreateGuestNoteResult
    >(
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

  @Get('guests/:guestId/notes')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_VIEW)
  @ApiOperation({
    summary: 'Get all internal notes for a guest',
  })
  @ApiResponse({
    status: 200,
    description: 'Guest notes retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getGuestNotes(
    @Param('guestId') guestId: string,
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.queryBus.execute<
      GetGuestNotesByGuestIdQuery,
      GetGuestNotesByGuestIdResult
    >(new GetGuestNotesByGuestIdQuery(user.tenantId, guestId, page, limit));

    return {
      message: 'Guest notes retrieved successfully',
      data: {
        items: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['checkIn', 'createdAt'],
  })
  @ApiQuery({ name: 'sortDirection', required: false, enum: ['asc', 'desc'] })
  async getGuestBookings(
    @Param('guestId') guestId: string,
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy') sortBy: 'checkIn' | 'createdAt' = 'checkIn',
    @Query('sortDirection') sortDirection: 'asc' | 'desc' = 'desc',
  ) {
    const result = await this.queryBus.execute<
      GetGuestBookingsQuery,
      GetGuestBookingsResult
    >(
      new GetGuestBookingsQuery(
        user.tenantId,
        guestId,
        page,
        limit,
        sortBy,
        sortDirection,
      ),
    );

    return {
      message: 'Guest bookings retrieved successfully',
      data: {
        items: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Patch('guests/:guestId/tags')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({ summary: 'Assign tags to a guest' })
  @ApiResponse({
    status: 200,
    description: 'Tags assigned successfully',
  })
  async assignTags(
    @Param('guestId') guestId: string,
    @Body('tags') tags: string[],
    @CurrentUser() user: JwtPayload,
  ) {
    await this.commandBus.execute(
      new AssignGuestTagsCommand(guestId, tags, user.tenantId),
    );

    return {
      message: 'Tags assigned successfully',
    };
  }

  @Patch('guests/:guestId/preferences')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({ summary: 'Update free-text preference notes for a guest' })
  @ApiResponse({
    status: 200,
    description: 'Guest preferences updated successfully',
  })
  @ApiResponse({
    status: 403,
    description:
      'Plan does not allow guest preferences management or insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  async updatePreferences(
    @Param('guestId') guestId: string,
    @Body() dto: SaveGuestPreferencesDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.commandBus.execute<
      SaveGuestPreferencesCommand,
      SaveGuestPreferencesResult
    >(
      new SaveGuestPreferencesCommand(
        user.tenantId,
        guestId,
        dto.preferencesNotes,
        user.activePlan,
      ),
    );

    return {
      message: 'Guest preferences updated successfully',
      data: { guestId: result.guestId, wasCreated: result.wasCreated },
    };
  }

  @Get('guests/:guestId/emails')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_VIEW)
  @ApiOperation({
    summary: 'Get communication history (emails) for a guest',
  })
  @ApiResponse({
    status: 200,
    description: 'Guest emails retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getGuestEmails(
    @Param('guestId') guestId: string,
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.queryBus.execute<
      GetGuestEmailsByGuestIdQuery,
      GetGuestEmailsByGuestIdResult
    >(new GetGuestEmailsByGuestIdQuery(user.tenantId, guestId, page, limit));

    return {
      message: 'Guest communication history retrieved successfully',
      data: {
        items: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    };
  }

  @Post('guests/:guestId/messages')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({
    summary: 'Send an email or message to a guest',
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent and recorded successfully',
  })
  async sendGuestMessage(
    @Param('guestId') guestId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SendGuestMessageDto,
  ) {
    const result = await this.commandBus.execute<
      SendGuestMessageCommand,
      { id: string }
    >(
      new SendGuestMessageCommand(
        user.tenantId,
        guestId,
        dto.subject,
        dto.body,
        dto.templateId,
        dto.attachments,
        user.userId,
      ),
    );

    return {
      message: 'Message sent and recorded successfully',
      data: result,
    };
  }
}
