import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { GuestJwtPayload } from '@/application/guest-auth/services/guest-jwt.service';
import {
  GUEST_ACCOUNT_REPOSITORY,
  type GuestAccountRepository,
} from '@/domain/guest-account/repositories/guest-account.repository';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { GuestAccountStatusEnum } from '@/domain/guest-account/value-objects/guest-account-status.vo';

@Injectable()
export class GuestJwtStrategy extends PassportStrategy(Strategy, 'guest-jwt') {
  constructor(
    configService: ConfigService,
    @Inject(GUEST_ACCOUNT_REPOSITORY)
    private readonly guestAccountRepository: GuestAccountRepository,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET')?.toString();
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: GuestJwtPayload & { iat: number }) {
    // Reject staff tokens on guest endpoints
    if (payload.type !== 'guest') {
      throw new UnauthorizedException('Invalid token type');
    }

    const account = await this.guestAccountRepository.findById(
      GuestAccountId.createFromString(payload.guestAccountId),
    );

    if (!account) {
      throw new UnauthorizedException('Guest account no longer exists');
    }

    if (account.getStatus() === GuestAccountStatusEnum.SUSPENDED) {
      throw new UnauthorizedException('Guest account is suspended');
    }

    const passwordChangedAt = account.getPasswordChangedAt();
    if (passwordChangedAt) {
      const changedTimestamp = Math.floor(passwordChangedAt.getTime() / 1000);
      if (payload.iat < changedTimestamp) {
        throw new UnauthorizedException(
          'Session invalidated due to password change',
        );
      }
    }

    return {
      type: 'guest' as const,
      guestAccountId: payload.guestAccountId,
      email: payload.email,
      emailVerified: payload.emailVerified,
    };
  }
}
