import { UnauthorizedException } from '@nestjs/common';
import {
  ConfirmRecoverPasswordHandler,
  ConfirmRecoverPasswordResult,
} from '@/application/auth/commands/confirm-recover-password.handler';
import { ConfirmRecoverPasswordCommand } from '@/application/auth/commands/confirm-recover-password.command';
import { UserRepository } from '@/domain/user/repositories/user.repository';
import { IPasswordHasher } from '@/application/auth/services/password-hasher.service';
import { createUserRepositoryMock } from '@test/shared/mocks/repositories/user-repository.mock';
import { createPasswordHasherMock } from '@test/shared/mocks/services/password-hasher.mock';
import { makeUser } from '@test/shared/fixtures/user.fixture';

describe('ConfirmRecoverPasswordHandler', () => {
  let handler: ConfirmRecoverPasswordHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(() => {
    userRepository = createUserRepositoryMock();
    passwordHasher = createPasswordHasherMock();

    handler = new ConfirmRecoverPasswordHandler(userRepository, passwordHasher);
  });

  describe('when token and passwords are valid', () => {
    it('should update user password and return success message', async () => {
      const user = makeUser();
      const plainToken = 'reset-token-123';
      const newPassword = 'NewPassword!123';

      userRepository.findByResetToken.mockResolvedValue(user);
      const isResetTokenValidSpy = jest
        .spyOn(user, 'isResetTokenValid')
        .mockReturnValue(true);
      const resetPasswordWithTokenSpy = jest.spyOn(
        user,
        'resetPasswordWithToken',
      );
      passwordHasher.hash.mockResolvedValue('hashed-new-password');

      const result = await handler.execute(
        new ConfirmRecoverPasswordCommand(plainToken, newPassword, newPassword),
      );

      expect(result).toBeInstanceOf(ConfirmRecoverPasswordResult);
      expect(result.message).toBe('Password has been reset successfully');
      expect(userRepository.findByResetToken).toHaveBeenCalledWith(
        expect.any(String),
      );
      expect(isResetTokenValidSpy).toHaveBeenCalledWith(expect.any(Date));
      expect(passwordHasher.hash).toHaveBeenCalledWith(newPassword);
      expect(resetPasswordWithTokenSpy).toHaveBeenCalledWith(
        'hashed-new-password',
        expect.any(Date),
      );
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('when passwords do not match', () => {
    it('should throw UnauthorizedException and not search for user', async () => {
      const plainToken = 'reset-token-123';
      const password1 = 'NewPassword!123';
      const password2 = 'DifferentPassword!123';

      await expect(
        handler.execute(
          new ConfirmRecoverPasswordCommand(plainToken, password1, password2),
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepository.findByResetToken).not.toHaveBeenCalled();
    });

    it('should throw error with specific message', async () => {
      const plainToken = 'reset-token-123';
      const password1 = 'NewPassword!123';
      const password2 = 'DifferentPassword!123';

      await expect(
        handler.execute(
          new ConfirmRecoverPasswordCommand(plainToken, password1, password2),
        ),
      ).rejects.toThrow('Passwords do not match');
    });
  });

  describe('when reset token does not exist', () => {
    it('should throw UnauthorizedException with invalid token message', async () => {
      const plainToken = 'invalid-token';
      const newPassword = 'NewPassword!123';

      userRepository.findByResetToken.mockResolvedValue(null);

      await expect(
        handler.execute(
          new ConfirmRecoverPasswordCommand(
            plainToken,
            newPassword,
            newPassword,
          ),
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepository.findByResetToken).toHaveBeenCalledWith(
        expect.any(String),
      );
    });

    it('should throw error with specific message', async () => {
      const plainToken = 'invalid-token';
      const newPassword = 'NewPassword!123';

      userRepository.findByResetToken.mockResolvedValue(null);

      await expect(
        handler.execute(
          new ConfirmRecoverPasswordCommand(
            plainToken,
            newPassword,
            newPassword,
          ),
        ),
      ).rejects.toThrow('Invalid or expired recovery token');
    });
  });

  describe('when reset token has expired', () => {
    it('should clear token and throw UnauthorizedException', async () => {
      const user = makeUser();
      const plainToken = 'expired-token';
      const newPassword = 'NewPassword!123';

      userRepository.findByResetToken.mockResolvedValue(user);
      const clearResetTokenSpy = jest.spyOn(user, 'clearResetToken');

      await expect(
        handler.execute(
          new ConfirmRecoverPasswordCommand(
            plainToken,
            newPassword,
            newPassword,
          ),
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(clearResetTokenSpy).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw error with specific message', async () => {
      const user = makeUser();
      const plainToken = 'expired-token';
      const newPassword = 'NewPassword!123';

      userRepository.findByResetToken.mockResolvedValue(user);
      jest.spyOn(user, 'isResetTokenValid').mockReturnValue(false);

      await expect(
        handler.execute(
          new ConfirmRecoverPasswordCommand(
            plainToken,
            newPassword,
            newPassword,
          ),
        ),
      ).rejects.toThrow('Invalid or expired recovery token');
    });
  });

  describe('when password hasher fails', () => {
    it('should propagate the error', async () => {
      const user = makeUser();
      const plainToken = 'reset-token-123';
      const newPassword = 'NewPassword!123';

      userRepository.findByResetToken.mockResolvedValue(user);
      user.isResetTokenValid = jest.fn().mockReturnValue(true);
      passwordHasher.hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(
        handler.execute(
          new ConfirmRecoverPasswordCommand(
            plainToken,
            newPassword,
            newPassword,
          ),
        ),
      ).rejects.toThrow('Hashing failed');
    });
  });
});
