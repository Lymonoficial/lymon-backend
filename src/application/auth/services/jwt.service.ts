import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface JwtPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
  emailVerified: boolean;
}

export interface ITokenService {
  generateAccesToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  verifyToken(token: string): JwtPayload;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwtService: NestJwtService) {}
  generateAccesToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }
  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }
  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}
