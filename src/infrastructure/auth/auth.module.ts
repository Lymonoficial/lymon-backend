import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  JwtTokenService,
  TOKEN_SERVICE,
} from '@/application/auth/services/jwt.service';
import {
  BcryptPasswordHasher,
  PASSWORD_HASHER,
} from '@/application/auth/services/password-hasher.service';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';

@Module({
  imports: [
    PersistenceModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
  exports: [TOKEN_SERVICE, PASSWORD_HASHER, PassportModule, JwtModule],
})
export class AuthModule {}
