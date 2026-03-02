import { LoginCommand } from '@/application/auth/commands/login.command';
import { LoginResult } from '@/application/auth/commands/login.handler';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { RegisterTenantCommand } from '@/application/tenant/commands/register-tenant.command';
import { RegisterTenantResult } from '@/application/tenant/commands/register-tenant.handler';
import { VerifyEmailCommand } from '@/application/user/commands/verify-email.command';
import { RecoverPasswordCommand } from '@/application/auth/commands/recover-password.command';
import { RecoverPasswordResult } from '@/application/auth/commands/recover-password.handler';
import { ConfirmRecoverPasswordCommand } from '@/application/auth/commands/confirm-recover-password.command';
import { ConfirmRecoverPasswordResult } from '@/application/auth/commands/confirm-recover-password.handler';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterTenantDto } from '@/presentation/dtos/register-tenant.dto';
import { LoginDto } from '@/presentation/dtos/login.dto';
import { RecoverPasswordDto } from '@/presentation/dtos/recover-password.dto';
import { ConfirmRecoverPasswordDto } from '@/presentation/dtos/confirm-recover-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new tenant with owner account' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  async register(@Body() dto: RegisterTenantDto) {
    const command = new RegisterTenantCommand(
      dto.tenantName,
      dto.email,
      dto.password,
      dto.planType,
    );

    const result = await this.commandBus.execute<
      RegisterTenantCommand,
      RegisterTenantResult
    >(command);

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      data: {
        tenantId: result.tenantId,
        userId: result.userId,
        email: result.email,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: LoginDto) {
    const command = new LoginCommand(dto.email, dto.password);
    const result = await this.commandBus.execute<LoginCommand, LoginResult>(
      command,
    );

    return {
      message: 'Login successful',
      data: {
        userId: result.userId,
        email: result.email,
        tenantId: result.tenantId,
        role: result.role,
        emailVerified: result.emailVerified,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with JWT token from email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Query('token') token: string) {
    const command = new VerifyEmailCommand(token);
    await this.commandBus.execute(command);

    return {
      message: 'Email verified successfully. You can now access all features.',
    };
  }

  @Public()
  @Post('recover-password')
  @ApiOperation({ summary: 'Request password recovery email' })
  @ApiResponse({
    status: 200,
    description: 'Recovery email sent if account exists',
  })
  async recoverPassword(@Body() dto: RecoverPasswordDto) {
    const command = new RecoverPasswordCommand(dto.email);
    const result = await this.commandBus.execute<
      RecoverPasswordCommand,
      RecoverPasswordResult
    >(command);

    return {
      message: result.message,
    };
  }

  @Public()
  @Post('recover-password/confirm')
  @ApiOperation({ summary: 'Confirm password recovery with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async confirmRecoverPassword(@Body() dto: ConfirmRecoverPasswordDto) {
    const command = new ConfirmRecoverPasswordCommand(
      dto.token,
      dto.newPassword,
      dto.newPasswordConfirmation,
    );
    const result = await this.commandBus.execute<
      ConfirmRecoverPasswordCommand,
      ConfirmRecoverPasswordResult
    >(command);

    return {
      message: result.message,
    };
  }

  // TODO: Prueba naada más por ahora
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  getMe(@CurrentUser() user: JwtPayload) {
    return {
      data: user,
    };
  }
}
