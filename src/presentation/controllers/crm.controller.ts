import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { SearchGuestsQuery } from '@/application/guest/queries/search-guests.query';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignGuestTagsCommand } from '@/application/guest/commands/assign-guest-tags.command';
import { Request } from '@nestjs/common';
import { Post, Body, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateGuestNoteCommand } from '@/application/guest-note/commands/create-guest-note.command';
import { CreateGuestNoteDto } from '@/presentation/dtos/create-guest-note.dto';
import { GetGuestBookingsQuery } from '@/application/guest/queries/get-guest-bookings/get-guest-bookings.query';
import { GetGuestBookingsResult } from '@/application/guest/queries/get-guest-bookings/get-guest-bookings.result';
import { GetGuestNotesByGuestIdQuery } from '@/application/guest-note/queries/get-guest-notes-by-guest-id/get-guest-notes-by-guest-id.query';
import { GetGuestNotesByGuestIdResult } from '@/application/guest-note/queries/get-guest-notes-by-guest-id/get-guest-notes-by-guest-id.result';
import { GetGuestEmailsByGuestIdQuery } from '@/application/guest-email/queries/get-guest-emails-by-guest-id/get-guest-emails-by-guest-id.query';
import { GetGuestEmailsByGuestIdResult } from '@/application/guest-email/queries/get-guest-emails-by-guest-id/get-guest-emails-by-guest-id.result';
import { SendGuestMessageCommand } from '@/application/guest-email/commands/send-guest-message/send-guest-message.command';
import { SendGuestMessageDto } from '@/presentation/dtos/send-guest-message.dto';

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
        guestId: guest.getId()?.toString(),
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
  async getGuestNotes(
    @Param('guestId') guestId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.queryBus.execute<
      GetGuestNotesByGuestIdQuery,
      GetGuestNotesByGuestIdResult
    >(new GetGuestNotesByGuestIdQuery(user.tenantId, guestId));

    return {
      message: 'Guest notes retrieved successfully',
      data: result.items,
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
  async getGuestEmails(
    @Param('guestId') guestId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.queryBus.execute<
      GetGuestEmailsByGuestIdQuery,
      GetGuestEmailsByGuestIdResult
    >(new GetGuestEmailsByGuestIdQuery(user.tenantId, guestId));

    return {
      message: 'Guest communication history retrieved successfully',
      data: result.items,
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
    const result = await this.commandBus.execute(
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
