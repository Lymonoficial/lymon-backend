import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CreateGuestCommand } from '@/application/guest/commands/create-guest.command';
import { CreateGuestResult } from '@/application/guest/commands/create-guest.result';
import { SearchGuestsQuery } from '@/application/guest/queries/search-guests.query';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { CreateGuestDto } from '@/presentation/dtos/create-guest.dto';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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
    name: 'term',
    required: false,
    description: 'Search by name, email, document number or phone',
  })
  @ApiResponse({ status: 200, description: 'Guests retrieved successfully' })
  async getAll(@CurrentUser() user: JwtPayload, @Query('term') term = '') {
    const guests = await this.searchGuestsQuery.execute(
      TenantId.createFromString(user.tenantId),
      term,
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
      total: guests.length,
    };
  }
}
