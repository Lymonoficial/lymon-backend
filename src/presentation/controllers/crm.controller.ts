import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { SearchGuestsQuery } from '@/application/guest/queries/search-guests.query';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import {
  Controller,
  Delete,
  Get,
  Patch,
  ParseBoolPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
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
import { ListCatalogItemsByTenantQuery } from '@/application/guest-preference/queries/list-catalog-items-by-tenant/list-catalog-items-by-tenant.query';
import { ListCatalogItemsByTenantResult } from '@/application/guest-preference/queries/list-catalog-items-by-tenant/list-catalog-items-by-tenant.result';
import { CreateCustomCatalogItemCommand } from '@/application/guest-preference/commands/create-custom-catalog-item/create-custom-catalog-item.command';
import { UpdateCustomCatalogItemCommand } from '@/application/guest-preference/commands/update-custom-catalog-item/update-custom-catalog-item.command';
import { DeleteCustomCatalogItemCommand } from '@/application/guest-preference/commands/delete-custom-catalog-item/delete-custom-catalog-item.command';
import { ToggleCatalogItemCommand } from '@/application/guest-preference/commands/toggle-catalog-item/toggle-catalog-item.command';
import { CreateCatalogItemDto } from '@/presentation/dtos/create-catalog-item.dto';
import { UpdateCatalogItemDto } from '@/presentation/dtos/update-catalog-item.dto';
import { ToggleCatalogItemDto } from '@/presentation/dtos/toggle-catalog-item.dto';

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
        dto.preferences.map((p) => p.catalogItemId),
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

  // ── Catalog endpoints ────────────────────────────────────────────────────────

  @Get('catalog')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_VIEW)
  @ApiOperation({ summary: 'List preference catalog items for the tenant' })
  @ApiResponse({
    status: 200,
    description: 'Catalog items retrieved successfully',
  })
  async listCatalogItems(
    @CurrentUser() user: JwtPayload,
    @Query('includeInactive', new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean,
  ) {
    const result = await this.queryBus.execute<
      ListCatalogItemsByTenantQuery,
      ListCatalogItemsByTenantResult
    >(new ListCatalogItemsByTenantQuery(user.tenantId, includeInactive));

    return {
      message: 'Catalog items retrieved successfully',
      data: result.items,
    };
  }

  @Patch('catalog/:itemId/toggle')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({ summary: 'Activate or deactivate a catalog item' })
  @ApiResponse({
    status: 200,
    description: 'Catalog item toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Catalog item not found' })
  async toggleCatalogItem(
    @Param('itemId') itemId: string,
    @Body() dto: ToggleCatalogItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.commandBus.execute(
      new ToggleCatalogItemCommand(user.tenantId, itemId, dto.activate),
    );

    return { message: 'Catalog item toggled successfully' };
  }

  @Post('catalog')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({ summary: 'Create a custom catalog item' })
  @ApiResponse({
    status: 201,
    description: 'Catalog item created successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Plan does not allow custom catalog items',
  })
  async createCatalogItem(
    @Body() dto: CreateCatalogItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const itemId = await this.commandBus.execute<
      CreateCustomCatalogItemCommand,
      string
    >(
      new CreateCustomCatalogItemCommand(
        user.tenantId,
        user.activePlan,
        dto.category,
        dto.label,
      ),
    );

    return {
      message: 'Catalog item created successfully',
      data: { itemId },
    };
  }

  @Patch('catalog/:itemId')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a custom catalog item' })
  @ApiResponse({
    status: 200,
    description: 'Catalog item updated successfully',
  })
  @ApiResponse({
    status: 403,
    description:
      'Plan does not allow custom catalog management or item is not custom',
  })
  @ApiResponse({ status: 404, description: 'Catalog item not found' })
  async updateCatalogItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCatalogItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.commandBus.execute(
      new UpdateCustomCatalogItemCommand(
        user.tenantId,
        user.activePlan,
        itemId,
        dto.label,
        dto.category,
      ),
    );

    return { message: 'Catalog item updated successfully' };
  }

  @Delete('catalog/:itemId')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a custom catalog item' })
  @ApiResponse({
    status: 200,
    description: 'Catalog item deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description:
      'Plan does not allow custom catalog management or item is not custom',
  })
  @ApiResponse({ status: 404, description: 'Catalog item not found' })
  async deleteCatalogItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.commandBus.execute(
      new DeleteCustomCatalogItemCommand(
        user.tenantId,
        user.activePlan,
        itemId,
      ),
    );

    return { message: 'Catalog item deleted successfully' };
  }
}
