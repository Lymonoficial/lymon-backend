import { UnauthorizedException } from '@nestjs/common';
import { GuestLoginHandler } from '@/application/guest-auth/commands/login-guest/login-guest.handler';
import { GuestLoginCommand } from '@/application/guest-auth/commands/login-guest/login-guest.command';
import { GuestLoginResult } from '@/application/guest-auth/commands/login-guest/login-guest.result';
import { GuestAccountRepository } from '@/domain/guest-account/repositories/guest-account.repository';
import { IPasswordHasher } from '@/application/auth/services/password-hasher.service';
import { IGuestTokenService } from '@/application/guest-auth/services/guest-jwt.service';
import { GuestAccountStatusEnum } from '@/domain/guest-account/value-objects/guest-account-status.vo';
import { createGuestAccountRepositoryMock } from '@test/shared/mocks/repositories/guest-account-repository.mock';
import { createPasswordHasherMock } from '@test/shared/mocks/services/password-hasher.mock';
import { createGuestTokenServiceMock } from '@test/shared/mocks/services/guest-token-service.mock';
import {
  makeGuestAccount,
  GUEST_ACCOUNT_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/guest-account.fixture';

describe('GuestLoginHandler', () => {
  let handler: GuestLoginHandler;
  let guestAccountRepository: jest.Mocked<GuestAccountRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenService: jest.Mocked<IGuestTokenService>;

  beforeEach(() => {
    guestAccountRepository = createGuestAccountRepositoryMock();
    passwordHasher = createPasswordHasherMock();
    tokenService = createGuestTokenServiceMock();

    handler = new GuestLoginHandler(
      guestAccountRepository,
      passwordHasher,
      tokenService,
    );
  });

  describe('when the email is not registered', () => {
    it('throws UnauthorizedException("Invalid credentials")', async () => {
      guestAccountRepository.findByEmail.mockResolvedValue(null);

      await expect(
        handler.execute(
          new GuestLoginCommand('unknown@example.com', 'any-password'),
        ),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });

  describe('when the account is suspended', () => {
    it('throws UnauthorizedException("Account is suspended")', async () => {
      guestAccountRepository.findByEmail.mockResolvedValue(
        makeGuestAccount({ status: GuestAccountStatusEnum.SUSPENDED }),
      );

      await expect(
        handler.execute(
          new GuestLoginCommand(
            GUEST_ACCOUNT_FIXTURE_DEFAULTS.email,
            'any-password',
          ),
        ),
      ).rejects.toThrow(new UnauthorizedException('Account is suspended'));
    });
  });

  describe('when the password is incorrect', () => {
    it('throws UnauthorizedException("Invalid credentials")', async () => {
      guestAccountRepository.findByEmail.mockResolvedValue(
        makeGuestAccount({ status: GuestAccountStatusEnum.ACTIVE }),
      );
      passwordHasher.compare.mockResolvedValue(false);

      await expect(
        handler.execute(
          new GuestLoginCommand(
            GUEST_ACCOUNT_FIXTURE_DEFAULTS.email,
            'wrong-password',
          ),
        ),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
  });

  describe('when credentials are valid and account is active', () => {
    it('returns a GuestLoginResult with tokens', async () => {
      guestAccountRepository.findByEmail.mockResolvedValue(
        makeGuestAccount({
          status: GuestAccountStatusEnum.ACTIVE,
          emailVerified: true,
        }),
      );
      passwordHasher.compare.mockResolvedValue(true);

      const result = await handler.execute(
        new GuestLoginCommand(
          GUEST_ACCOUNT_FIXTURE_DEFAULTS.email,
          'correct-password',
        ),
      );

      expect(result).toBeInstanceOf(GuestLoginResult);
      expect(result.guestAccountId).toBe(GUEST_ACCOUNT_FIXTURE_DEFAULTS.id);
      expect(result.email).toBe(GUEST_ACCOUNT_FIXTURE_DEFAULTS.email);
      expect(result.emailVerified).toBe(true);
      expect(result.accessToken).toBe('guest-access-token');
      expect(result.refreshToken).toBe('guest-refresh-token');
    });
  });
});
