import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterGuestAccountCommand } from '@/application/guest-auth/commands/register-guest-account/register-guest-account.command';
import { RegisterGuestAccountResult } from '@/application/guest-auth/commands/register-guest-account/register-guest-account.result';
import { VerifyGuestEmailCommand } from '@/application/guest-auth/commands/verify-guest-email/verify-guest-email.command';
import { VerifyGuestEmailResult } from '@/application/guest-auth/commands/verify-guest-email/verify-guest-email.handler';
import { GuestLoginCommand } from '@/application/guest-auth/commands/login-guest/login-guest.command';
import { GuestLoginResult } from '@/application/guest-auth/commands/login-guest/login-guest.result';
import { RecoverGuestPasswordCommand } from '@/application/guest-auth/commands/recover-guest-password/recover-guest-password.command';
import { RecoverGuestPasswordResult } from '@/application/guest-auth/commands/recover-guest-password/recover-guest-password.handler';
import { ConfirmRecoverGuestPasswordCommand } from '@/application/guest-auth/commands/confirm-recover-guest-password/confirm-recover-guest-password.command';
import { ConfirmRecoverGuestPasswordResult } from '@/application/guest-auth/commands/confirm-recover-guest-password/confirm-recover-guest-password.handler';
import { GuestJwtAuthGuard } from '@/infrastructure/guest-auth/guards/guest-jwt-auth.guard';
import { GuestPublic } from '@/infrastructure/guest-auth/decorators/guest-public.decorator';
import { RegisterGuestAccountDto } from '@/presentation/dtos/register-guest-account.dto';
import { GuestLoginDto } from '@/presentation/dtos/guest-login.dto';
import { RecoverGuestPasswordDto } from '@/presentation/dtos/recover-guest-password.dto';
import { ConfirmRecoverGuestPasswordDto } from '@/presentation/dtos/confirm-recover-guest-password.dto';

@ApiTags('guest-auth')
@UseGuards(GuestJwtAuthGuard)
@Controller('guest/auth')
export class GuestAuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @GuestPublic()
  @Post('register')
  @ApiOperation({ summary: 'Register a new guest account' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  async register(@Body() dto: RegisterGuestAccountDto) {
    const result = await this.commandBus.execute<
      RegisterGuestAccountCommand,
      RegisterGuestAccountResult
    >(
      new RegisterGuestAccountCommand(
        dto.fullName,
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
      ),
    );

    return {
      message: result.message,
      data: {
        guestAccountId: result.guestAccountId,
        email: result.email,
      },
    };
  }

  @GuestPublic()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify guest email address' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  async verifyEmail(@Query('token') token: string) {
    const result = await this.commandBus.execute<
      VerifyGuestEmailCommand,
      VerifyGuestEmailResult
    >(new VerifyGuestEmailCommand(token));

    return { message: result.message };
  }

  @GuestPublic()
  @Post('login')
  @ApiOperation({ summary: 'Login as a guest' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: GuestLoginDto) {
    const result = await this.commandBus.execute<
      GuestLoginCommand,
      GuestLoginResult
    >(new GuestLoginCommand(dto.email, dto.password));

    return {
      message: 'Login successful',
      data: {
        guestAccountId: result.guestAccountId,
        email: result.email,
        emailVerified: result.emailVerified,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @GuestPublic()
  @Post('recover-password')
  @ApiOperation({ summary: 'Request a guest password recovery email' })
  @ApiResponse({ status: 200 })
  async recoverPassword(@Body() dto: RecoverGuestPasswordDto) {
    const result = await this.commandBus.execute<
      RecoverGuestPasswordCommand,
      RecoverGuestPasswordResult
    >(new RecoverGuestPasswordCommand(dto.email));

    return { message: result.message };
  }

  @GuestPublic()
  @Post('confirm-recover-password')
  @ApiOperation({ summary: 'Confirm guest password recovery' })
  @ApiResponse({ status: 200 })
  async confirmRecoverPassword(@Body() dto: ConfirmRecoverGuestPasswordDto) {
    const result = await this.commandBus.execute<
      ConfirmRecoverGuestPasswordCommand,
      ConfirmRecoverGuestPasswordResult
    >(
      new ConfirmRecoverGuestPasswordCommand(
        dto.token,
        dto.newPassword,
        dto.newPasswordConfirmation,
      ),
    );

    return { message: result.message };
  }
}
