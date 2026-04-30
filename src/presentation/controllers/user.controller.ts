import {
  Body,
  Controller,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { ChangePasswordCommand } from '@/application/user/commands/change-password/change-password.command';
import { ChangePasswordResult } from '@/application/user/commands/change-password/change-password.handler';
import { ChangePasswordDto } from '@/presentation/dtos/change-password.dto';
import { InviteStaffDto } from '@/presentation/dtos/invite-staff.dto';
import { InviteStaffCommand } from '@/application/user/commands/invite-staff/invite-staff.command';
import { RoleAssignment } from '@/domain/user/entities/user.entity';
import { GetStaffByTenantQuery } from '@/application/user/queries/get-staff-by-tenant/get-staff-by-tenant.query';
import { DeleteUserCommand } from '@/application/user/commands/delete-user/delete-user.command';
import type {
  GetStaffByTenantResult,
  StaffDto,
} from '@/application/user/queries/get-staff-by-tenant/get-staff-by-tenant.result';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ) {
    const command = new ChangePasswordCommand(
      jwtPayload.userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    const result = await this.commandBus.execute<
      ChangePasswordCommand,
      ChangePasswordResult
    >(command);

    return {
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-staff')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Invite a staff member to the tenant' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Staff member added successfully',
  })
  async addStaff(
    @Body() dto: InviteStaffDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ) {
    const command = new InviteStaffCommand(
      dto.email,
      dto.password,
      jwtPayload.tenantId,
      dto.roleAssignments as unknown as RoleAssignment[],
      jwtPayload.userId,
      jwtPayload.email,
    );

    await this.commandBus.execute(command);

    return {
      message: 'Staff member added successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('staff')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List invited staff for the current tenant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Staff retrieved successfully',
  })
  async getStaff(
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<{ message: string; data: StaffDto[]; total: number }> {
    const result = await this.queryBus.execute<
      GetStaffByTenantQuery,
      GetStaffByTenantResult
    >(new GetStaffByTenantQuery(jwtPayload.tenantId));

    const items: StaffDto[] = result?.items ?? [];

    return {
      message: 'Staff retrieved successfully',
      data: items,
      total: items.length,
    };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.TENANT_SETTINGS_EDIT)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete staff member (Soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID to delete' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  async deleteUser(@Param('id') userId: string) {
    const command = new DeleteUserCommand(userId);
    await this.commandBus.execute(command);

    return {
      message: 'User deleted successfully',
    };
  }
}
