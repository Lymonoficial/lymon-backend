import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@/application/auth/services/jwt.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const JWT_SECRET = configService.get<string>('JWT_SECRET')?.toString();
    if (!JWT_SECRET) {
      throw new Error(
        'JWT_SECRET no está definida en las variables de entorno',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return {
      userId: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
      emailVerified: payload.emailVerified,
    };
  }
}
