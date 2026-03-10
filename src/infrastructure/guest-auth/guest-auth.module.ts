import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { GuestJwtStrategy } from '@/infrastructure/guest-auth/strategies/guest-jwt.strategy';
import {
  GuestJwtTokenService,
  GUEST_TOKEN_SERVICE,
} from '@/application/guest-auth/services/guest-jwt.service';
import {
  BcryptPasswordHasher,
  PASSWORD_HASHER,
} from '@/application/auth/services/password-hasher.service';

@Module({
  imports: [
    PersistenceModule,
    PassportModule.register({ defaultStrategy: 'guest-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    GuestJwtStrategy,
    {
      provide: GUEST_TOKEN_SERVICE,
      useClass: GuestJwtTokenService,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: [GUEST_TOKEN_SERVICE, PASSWORD_HASHER, PassportModule, JwtModule],
})
export class GuestAuthModule {}
