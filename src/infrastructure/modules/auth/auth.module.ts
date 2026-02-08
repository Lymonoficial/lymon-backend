import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from '../../controllers/auth/auth.controller';
import { AuthService } from '../../../application/use-cases/auth.service';
import { JwtStrategy } from '../../auth/jwt.strategy';
import { UserDocument, UserSchema } from '../../persistence/mongoose/user.schema';
import { MongooseUserRepository } from '../../persistence/mongoose/repositories/user.repository';

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
export class AuthModule {}
