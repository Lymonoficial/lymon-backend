import { UnauthorizedException } from '@nestjs/common';
import {
  LoginHandler,
  LoginResult,
} from '@/application/auth/commands/login.handler';
import { LoginCommand } from '@/application/auth/commands/login.command';
import { UserRepository } from '@/domain/user/repositories/user.repository';
import { TenantRepository } from '@/domain/tenant/repositories/tenant.repository';
import { IPasswordHasher } from '@/application/auth/services/password-hasher.service';
import { ITokenService } from '@/application/auth/services/jwt.service';
import { UserRoleEnum } from '@/domain/user/entities/user.entity';
import { createUserRepositoryMock } from '@test/shared/mocks/repositories/user-repository.mock';
import { createTenantRepositoryMock } from '@test/shared/mocks/repositories/tenant-repository.mock';
import { createPasswordHasherMock } from '@test/shared/mocks/services/password-hasher.mock';
import { createTokenServiceMock } from '@test/shared/mocks/services/token-service.mock';
import {
  makeUser,
  USER_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/user.fixture';
import { makeTenant } from '@test/shared/fixtures/tenant.fixture';

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let userRepository: jest.Mocked<UserRepository>;
  let tenantRepository: jest.Mocked<TenantRepository>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;
  let tokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    userRepository = createUserRepositoryMock();
    tenantRepository = createTenantRepositoryMock();
    passwordHasher = createPasswordHasherMock();
    tokenService = createTokenServiceMock();

    handler = new LoginHandler(
      userRepository,
      tenantRepository,
      passwordHasher,
      tokenService,
    );
  });

  describe('when credentials are valid', () => {
    it('returns a LoginResult with tokens', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());
      passwordHasher.compare.mockResolvedValue(true);
      tenantRepository.findById.mockResolvedValue(makeTenant());

      const result = await handler.execute(
        new LoginCommand(USER_FIXTURE_DEFAULTS.email, 'plain-password'),
      );

      expect(result).toBeInstanceOf(LoginResult);
      expect(result.userId).toBe(USER_FIXTURE_DEFAULTS.id);
      expect(result.email).toBe(USER_FIXTURE_DEFAULTS.email);
      expect(result.tenantId).toBe(USER_FIXTURE_DEFAULTS.tenantId);
      expect(result.role).toBe(UserRoleEnum.OWNER);
      expect(result.emailVerified).toBe(true);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });
  });

  describe('when the user does not exist', () => {
    it('throws UnauthorizedException', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        handler.execute(
          new LoginCommand(USER_FIXTURE_DEFAULTS.email, 'any-password'),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('when the password is wrong', () => {
    it('throws UnauthorizedException', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());
      passwordHasher.compare.mockResolvedValue(false);

      await expect(
        handler.execute(
          new LoginCommand(USER_FIXTURE_DEFAULTS.email, 'wrong-password'),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('when the tenant does not exist', () => {
    it('throws UnauthorizedException', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());
      passwordHasher.compare.mockResolvedValue(true);
      tenantRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(
          new LoginCommand(USER_FIXTURE_DEFAULTS.email, 'plain-password'),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
