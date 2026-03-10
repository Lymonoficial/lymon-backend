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

@ApiTags('crm')
@ApiBearerAuth('JWT-auth')
@Controller('crm')
export class CrmController {
  constructor(private readonly searchGuestsQuery: SearchGuestsQuery) {}

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
}
