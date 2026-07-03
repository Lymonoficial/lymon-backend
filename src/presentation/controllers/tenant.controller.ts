import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { UpdateTenantProfileDto } from '@/presentation/dtos/tenant/update-tenant-profile.dto';
import { UpdateTenantProfileCommand } from '@/application/tenant/commands/update-tenant-profile.command';
import { UpdateTenantProfileResult } from '@/application/tenant/commands/update-tenant-profile.result';
import { DeleteTenantCommand } from '@/application/tenant/commands/delete-tenant/delete-tenant.command';
import { GetTenantProfileQuery } from '@/application/tenant/queries/GetTenantProfile/get-tenant-profile.query';
import { GetTenantProfileResult } from '@/application/tenant/queries/GetTenantProfile/get-tenant-profile.result';
import { GenerateTenantLogoUrlQuery } from '@/application/tenant/queries/generate-tenant-logo-url/generate-tenant-logo-url.query';
import { GenerateTenantLogoUrlResult } from '@/application/tenant/queries/generate-tenant-logo-url/generate-tenant-logo-url.result';
import { SetTenantLogoCommand } from '@/application/tenant/commands/set-tenant-logo/set-tenant-logo.command';
import { SetTenantLogoResult } from '@/application/tenant/commands/set-tenant-logo/set-tenant-logo.handler';
import { TenantLogoUrlDto } from '@/presentation/dtos/tenant/tenant-logo-url.dto';
import { SaveTenantLogoDto } from '@/presentation/dtos/tenant/save-tenant-logo.dto';

@ApiTags('tenant')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tenant')
export class TenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get tenant profile' })
  @ApiResponse({ status: 200, description: 'Tenant profile data' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    const result = await this.queryBus.execute<
      GetTenantProfileQuery,
      GetTenantProfileResult
    >(new GetTenantProfileQuery(user.tenantId));

    return { data: result.profile };
  }

  @Patch('profile')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.TENANT_SETTINGS_EDIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant profile (Owner only)' })
  @ApiResponse({
    status: 200,
    description: 'Tenant profile updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only the Owner can modify tenant profile',
  })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTenantProfileDto,
  ) {
    const result = await this.commandBus.execute<
      UpdateTenantProfileCommand,
      UpdateTenantProfileResult
    >(
      new UpdateTenantProfileCommand(
        user.tenantId,
        dto.name,
        dto.contactPhone,
        dto.address,
        dto.description,
        dto.theme,
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Tenant profile updated successfully',
      data: { tenantId: result.tenantId },
    };
  }

  @Post('logo/presigned-url')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.TENANT_SETTINGS_EDIT)
  @ApiOperation({
    summary: 'Get a presigned R2 URL to upload the tenant logo (Owner only)',
  })
  @ApiResponse({ status: 201, description: 'Presigned URL generated' })
  @ApiResponse({ status: 400, description: 'Unsupported image type' })
  async getLogoUploadUrl(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TenantLogoUrlDto,
  ) {
    const result = await this.queryBus.execute<
      GenerateTenantLogoUrlQuery,
      GenerateTenantLogoUrlResult
    >(
      new GenerateTenantLogoUrlQuery(
        user.tenantId,
        dto.contentType,
        dto.fileSize,
      ),
    );

    return {
      message: 'Presigned URL generated',
      data: {
        presignedUrl: result.presignedUrl,
        fileUrl: result.fileUrl,
        key: result.key,
      },
    };
  }

  @Post('logo')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.TENANT_SETTINGS_EDIT)
  @ApiOperation({
    summary: 'Save the uploaded logo and remove the previous one (Owner only)',
  })
  @ApiResponse({ status: 201, description: 'Logo updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid logo key' })
  async saveLogo(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SaveTenantLogoDto,
  ) {
    const result = await this.commandBus.execute<
      SetTenantLogoCommand,
      SetTenantLogoResult
    >(
      new SetTenantLogoCommand(
        user.tenantId,
        dto.key,
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Logo updated successfully',
      data: { logoUrl: result.logoUrl },
    };
  }

  @Delete()
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.TENANT_SETTINGS_EDIT)
  @ApiOperation({
    summary: 'Delete tenant and its users (Owner only/Soft delete)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant deleted successfully',
  })
  async deleteTenant(@CurrentUser() user: JwtPayload) {
    const command = new DeleteTenantCommand(user.tenantId);
    await this.commandBus.execute(command);

    return {
      message: 'Tenant and associated users deleted successfully',
    };
  }
}
