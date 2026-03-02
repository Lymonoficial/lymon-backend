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
import { ChangePasswordCommand } from '@/application/user/commands/change-password.command';
import { ChangePasswordResult } from '@/application/user/commands/change-password.handler';
import { ChangePasswordDto } from '@/presentation/dtos/change-password.dto';

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
}
