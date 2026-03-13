import { ConflictException } from '@nestjs/common';
import { RegisterGuestAccountHandler } from '@/application/guest-auth/commands/register-guest-account/register-guest-account.handler';
import { RegisterGuestAccountCommand } from '@/application/guest-auth/commands/register-guest-account/register-guest-account.command';
import { RegisterGuestAccountResult } from '@/application/guest-auth/commands/register-guest-account/register-guest-account.result';
import { GuestAccountRepository } from '@/domain/guest-account/repositories/guest-account.repository';
import { IPasswordHasher } from '@/application/auth/services/password-hasher.service';
import { IEmailService } from '@/application/shared/services/email.service';
import { createGuestAccountRepositoryMock } from '@test/shared/mocks/repositories/guest-account-repository.mock';
import { createPasswordHasherMock } from '@test/shared/mocks/services/password-hasher.mock';
import { createEmailServiceMock } from '@test/shared/mocks/services/email-service.mock';
import { makeGuestAccount } from '@test/shared/fixtures/guest-account.fixture';

describe('RegisterGuestAccountHandler', () => {
  let handler: RegisterGuestAccountHandler;
  let guestAccountRepository: jest.Mocked<GuestAccountRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let emailService: jest.Mocked<IEmailService>;

  beforeEach(() => {
    guestAccountRepository = createGuestAccountRepositoryMock();
    passwordHasher = createPasswordHasherMock();
    emailService = createEmailServiceMock();

    handler = new RegisterGuestAccountHandler(
      guestAccountRepository,
      passwordHasher,
      emailService,
    );
  });

  describe('when the email is already registered', () => {
    it('throws ConflictException', async () => {
      guestAccountRepository.findByEmail.mockResolvedValue(makeGuestAccount());

      const command = new RegisterGuestAccountCommand(
        'John Doe',
        'guest@example.com',
        'SecurePass123!',
        'John',
        'Doe',
      );

      await expect(handler.execute(command)).rejects.toThrow(ConflictException);
      await expect(handler.execute(command)).rejects.toThrow(
        'An account with this email already exists',
      );

      expect(guestAccountRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('when the email is new and data is valid', () => {
    it('creates account, generates verification token, sends email and returns result', async () => {
      guestAccountRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue('hashed-password');
      guestAccountRepository.save.mockResolvedValue('new-guest-id');
      emailService.sendVerificationEmail.mockResolvedValue(undefined);

      const command = new RegisterGuestAccountCommand(
        'Jane Smith',
        'jane@example.com',
        'SecurePass123!',
        'Jane',
        'Smith',
      );

      const result = await handler.execute(command);

      // Validates the result type and values
      expect(result).toBeInstanceOf(RegisterGuestAccountResult);
      expect(result.guestAccountId).toBe('new-guest-id');
      expect(result.email).toBe('jane@example.com');
      expect(result.message).toBe(
        'Registration successful. Please check your email to verify your account.',
      );

      // Validates the password was hashed
      expect(passwordHasher.hash).toHaveBeenCalledWith('SecurePass123!');

      // Validates the account was saved
      expect(guestAccountRepository.save).toHaveBeenCalledTimes(1);

      // Validates the verification email was sent with the correct email and a token
      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        'jane@example.com',
        expect.any(String), // plain token (64-char hex)
      );

      // Validates the token sent is a 64-char hex string (32 random bytes)
      const sentToken = emailService.sendVerificationEmail.mock.calls[0][1];
      expect(sentToken).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
