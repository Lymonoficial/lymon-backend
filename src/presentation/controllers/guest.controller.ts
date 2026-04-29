import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { ChangeGuestPasswordCommand } from '@/application/guest-auth/commands/change-guest-password/change-guest-password.command';
import { ChangeGuestPasswordResult } from '@/application/guest-auth/commands/change-guest-password/change-guest-password.handler';
import { type GuestJwtPayload } from '@/application/guest-auth/services/guest-jwt.service';
import { CreateGuestCommand } from '@/application/guest/commands/create-guest.command';
import { CreateGuestResult } from '@/application/guest/commands/create-guest.result';
import { SearchGuestsQuery } from '@/application/guest/queries/search-guests.query';
import { GetGuestByIdQuery } from '@/application/guest/queries/get-guest-by-id/get-guest-by-id.query';
import type { GetGuestByIdResult } from '@/application/guest/queries/get-guest-by-id/get-guest-by-id.result';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { CurrentGuest } from '@/infrastructure/guest-auth/decorators/current-guest.decorator';
import { GuestJwtAuthGuard } from '@/infrastructure/guest-auth/guards/guest-jwt-auth.guard';
import { ChangePasswordDto } from '@/presentation/dtos/change-password.dto';
import { CreateGuestDto } from '@/presentation/dtos/create-guest.dto';
import { AssignGuestTagsCommand } from '@/application/guest/commands/assign-guest-tags.command';
import { UpdateTagsDto } from '../dtos/update-tags.dto';
import { SaveGuestPreferencesCommand } from '@/application/guest/commands/preferences/save-guest-preferences.command';
import { SaveGuestPreferencesResult } from '@/application/guest/commands/preferences/save-guest-preferences.result';
import { SaveGuestPreferencesDto } from '@/presentation/dtos/save-guest-preferences.dto';
import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('guests')
@ApiBearerAuth('JWT-auth')
@Controller('guests')
export class GuestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly searchGuestsQuery: SearchGuestsQuery,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({ summary: 'Create a new guest for the current tenant' })
  @ApiResponse({ status: 201, description: 'Guest created successfully' })
  @ApiResponse({
    status: 409,
    description: 'A guest with this primary email already exists',
  })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateGuestDto) {
    const result = await this.commandBus.execute<
      CreateGuestCommand,
      CreateGuestResult
    >(
      new CreateGuestCommand(
        user.tenantId,
        dto.fullName,
        dto.primaryEmail,
        dto.identity,
        dto.firstName,
        dto.lastName,
        dto.emails,
        dto.phones,
        dto.tags,
        dto.preferencesNotes,
      ),
    );

    return {
      message: 'Guest created successfully',
      data: {
        guestId: result.guestId,
      },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.CRM_VIEW)
  @ApiOperation({ summary: 'List all guests for the current tenant' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search by name, email, document number or phone',
  })
  @ApiResponse({ status: 200, description: 'Guests retrieved successfully' })
  async getAll(@CurrentUser() user: JwtPayload, @Query('q') term = '') {
    const { guests, total } = await this.searchGuestsQuery.execute(
      TenantId.createFromString(user.tenantId),
      term,
      1,
      1000,
      'createdAt',
      'desc',
    );

    return {
      message: 'Guests retrieved successfully',
      data: guests.map((guest) => ({
        id: guest.getId()?.toString() ?? '',
        fullName: guest.getFullName(),
        firstName: guest.getFirstName(),
        lastName: guest.getLastName(),
        primaryEmail: guest.getPrimaryEmail(),
        emails: guest.getEmails(),
        phones: guest.getPhones(),
        status: guest.getStatus(),
        tags: guest.getTags(),
        createdAt: guest.getCreatedAt(),
        updatedAt: guest.getUpdatedAt(),
      })),
      total,
    };
  }

  @Public()
  @UseGuards(GuestJwtAuthGuard)
  @Patch('change-password')
  @ApiBearerAuth('GuestJWT-auth')
  @ApiOperation({ summary: 'Change password from guest profile' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  @ApiResponse({
    status: 400,
    description: 'New password cannot be the same as the current password',
  })
  async changePassword(
    @CurrentGuest() guest: GuestJwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.commandBus.execute<
      ChangeGuestPasswordCommand,
      ChangeGuestPasswordResult
    >(
      new ChangeGuestPasswordCommand(
        guest.guestAccountId,
        dto.currentPassword,
        dto.newPassword,
      ),
    );

    return { message: result.message };
  }

  @Get(':guestId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.CRM_VIEW)
  @ApiOperation({ summary: 'Get complete profile of a guest by ID' })
  @ApiResponse({
    status: 200,
    description: 'Guest profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  async getById(
    @CurrentUser() user: JwtPayload,
    @Param('guestId') guestId: string,
  ) {
    const result = await this.queryBus.execute<
      GetGuestByIdQuery,
      GetGuestByIdResult
    >(new GetGuestByIdQuery(user.tenantId, guestId));

    if (!result.item) {
      throw new NotFoundException('Guest not found');
    }

    return {
      message: 'Guest profile retrieved successfully',
      data: result.item,
    };
  }

  @Patch(':guestId/tags')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({ summary: 'Assign tags to a specific guest' })
  @ApiResponse({ status: 200, description: 'Tags assigned successfully' })
  @ApiResponse({ status: 404, description: 'Guest not found' })
  async assignTags(
    @CurrentUser() user: JwtPayload,
    @Param('guestId') guestId: string,
    @Body() dto: UpdateTagsDto,
  ) {
    await this.commandBus.execute(
      new AssignGuestTagsCommand(guestId, dto.tags, user.tenantId),
    );

    return {
      message: 'Tags assigned successfully',
    };
  }

  @Patch(':guestId/preferences')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.CRM_MANAGE)
  @ApiOperation({
    summary:
      'Guardar (crear o actualizar) las notas de preferencias de un huésped',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencias del huésped guardadas correctamente',
  })
  @ApiResponse({
    status: 403,
    description: 'Plan no permite esta funcionalidad o permisos insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Huésped no encontrado' })
  async savePreferences(
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
      message: 'Guest preferences saved successfully',
      data: { guestId: result.guestId, wasCreated: result.wasCreated },
    };
  }
}
