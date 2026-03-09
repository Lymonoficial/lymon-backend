import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { GuestLoginCommand } from '@/application/guest-auth/commands/login-guest/login-guest.command';
import { GuestLoginResult } from '@/application/guest-auth/commands/login-guest/login-guest.result';
import {
  GUEST_ACCOUNT_REPOSITORY,
  type GuestAccountRepository,
} from '@/domain/guest-account/repositories/guest-account.repository';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from '@/application/auth/services/password-hasher.service';
import {
  GUEST_TOKEN_SERVICE,
  type IGuestTokenService,
  GuestJwtPayload,
} from '@/application/guest-auth/services/guest-jwt.service';
import { GuestAccountStatusEnum } from '@/domain/guest-account/value-objects/guest-account-status.vo';
import { Email } from '@/domain/shared/value-objects/email.vo';

@CommandHandler(GuestLoginCommand)
export class GuestLoginHandler implements ICommandHandler<GuestLoginCommand> {
  constructor(
    @Inject(GUEST_ACCOUNT_REPOSITORY)
    private readonly guestAccountRepository: GuestAccountRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(GUEST_TOKEN_SERVICE)
    private readonly tokenService: IGuestTokenService,
  ) {}

  async execute(command: GuestLoginCommand): Promise<GuestLoginResult> {
    const email = Email.create(command.email);

    const account = await this.guestAccountRepository.findByEmail(email);

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (account.getStatus() === GuestAccountStatusEnum.SUSPENDED) {
      throw new UnauthorizedException('Account is suspended');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      account.getPasswordHash(),
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: GuestJwtPayload = {
      type: 'guest',
      guestAccountId: account.getId()!.toString(),
      email: account.getEmail().toString(),
      emailVerified: account.isEmailVerified(),
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return new GuestLoginResult(
      account.getId()!.toString(),
      account.getEmail().toString(),
      account.isEmailVerified(),
      accessToken,
      refreshToken,
    );
  }
}
