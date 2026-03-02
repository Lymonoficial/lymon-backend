import { Body, Controller, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { ChangePasswordCommand } from '@/application/user/commands/change-password/change-password.command';
import { ChangePasswordResult } from '@/application/user/commands/change-password/change-password.handler';
import { ChangePasswordDto } from '@/presentation/dtos/change-password.dto';
import { InviteStaffDto } from '@/presentation/dtos/invite-staff.dto';
import { InviteStaffCommand } from '@/application/user/commands/invite-staff/invite-staff.command';
import { RoleAssignment } from '@/domain/user/entities/user.entity';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

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
    );

    await this.commandBus.execute(command);

    return {
      message: 'Staff member added successfully',
    };
  }
}
