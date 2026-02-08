import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@/infrastructure/auth/controllers/auth.controller';
import {
  UserDocument,
  UserSchema,
} from '../users/persistence/mongoose/schemas/user.schema';
import { AuthService } from '@/application/colaborators/use-cases/auth.service';
import { JwtStrategy } from './jwt.strategy';
import { MongooseUserRepository } from '../users/persistence/mongoose/repositories/user.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any, // Type assertion para evitar error de tipos
          },
        };
      },
    }),
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'UserRepository',
      useClass: MongooseUserRepository,
    },
    {
      provide: 'UserRepository',
      useExisting: MongooseUserRepository,
    },
    MongooseUserRepository,
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }
