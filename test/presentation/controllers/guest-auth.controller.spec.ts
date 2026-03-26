import { CommandBus } from '@nestjs/cqrs';
import { GuestAuthController } from '@/presentation/controllers/guest-auth.controller';
import { RegisterGuestAccountCommand } from '@/application/guest-auth/commands/register-guest-account/register-guest-account.command';
import { VerifyGuestEmailCommand } from '@/application/guest-auth/commands/verify-guest-email/verify-guest-email.command';
import { GuestLoginCommand } from '@/application/guest-auth/commands/login-guest/login-guest.command';
import { RecoverGuestPasswordCommand } from '@/application/guest-auth/commands/recover-guest-password/recover-guest-password.command';
import { ConfirmRecoverGuestPasswordCommand } from '@/application/guest-auth/commands/confirm-recover-guest-password/confirm-recover-guest-password.command';

describe('GuestAuthController', () => {
  let controller: GuestAuthController;
  let commandBus: { execute: jest.Mock };

  beforeEach(() => {
    commandBus = { execute: jest.fn() };
    controller = new GuestAuthController(commandBus as unknown as CommandBus);
  });

  it('register returns expected payload', async () => {
    commandBus.execute.mockResolvedValue({
      message: 'Registration successful',
      guestAccountId: 'guest-1',
      email: 'guest@example.com',
    });

    const result = await controller.register({
      fullName: 'John Doe',
      email: 'guest@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(RegisterGuestAccountCommand),
    );
    expect(result).toEqual({
      message: 'Registration successful',
      data: { guestAccountId: 'guest-1', email: 'guest@example.com' },
    });
  });

  it('verifyEmail returns message', async () => {
    commandBus.execute.mockResolvedValue({ message: 'Email verified' });

    const result = await controller.verifyEmail('token-123');

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(VerifyGuestEmailCommand),
    );
    expect(result).toEqual({ message: 'Email verified' });
  });

  it('login returns expected payload', async () => {
    commandBus.execute.mockResolvedValue({
      guestAccountId: 'guest-1',
      email: 'guest@example.com',
      emailVerified: true,
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const result = await controller.login({
      email: 'guest@example.com',
      password: 'StrongPass123!',
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(GuestLoginCommand),
    );
    expect(result).toEqual({
      message: 'Login successful',
      data: {
        guestAccountId: 'guest-1',
        email: 'guest@example.com',
        emailVerified: true,
        accessToken: 'access',
        refreshToken: 'refresh',
      },
    });
  });

  it('recoverPassword returns message', async () => {
    commandBus.execute.mockResolvedValue({ message: 'Recovery email sent' });

    const result = await controller.recoverPassword({
      email: 'guest@example.com',
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(RecoverGuestPasswordCommand),
    );
    expect(result).toEqual({ message: 'Recovery email sent' });
  });

  it('confirmRecoverPassword returns message', async () => {
    commandBus.execute.mockResolvedValue({ message: 'Password updated' });

    const result = await controller.confirmRecoverPassword({
      token: 'token-1',
      newPassword: 'StrongPass123!',
      newPasswordConfirmation: 'StrongPass123!',
    });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(ConfirmRecoverGuestPasswordCommand),
    );
    expect(result).toEqual({ message: 'Password updated' });
  });
});
