import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface GuestJwtPayload {
  /** Discriminator — prevents guest tokens from being used on staff endpoints */
  type: 'guest';
  guestAccountId: string;
  email: string;
  emailVerified: boolean;
}

export interface IGuestTokenService {
  generateAccessToken(payload: GuestJwtPayload): string;
  generateRefreshToken(payload: GuestJwtPayload): string;
  verifyToken(token: string): GuestJwtPayload;
}

export const GUEST_TOKEN_SERVICE = Symbol('GUEST_TOKEN_SERVICE');

@Injectable()
export class GuestJwtTokenService implements IGuestTokenService {
  constructor(private readonly jwtService: NestJwtService) {}

  generateAccessToken(payload: GuestJwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  generateRefreshToken(payload: GuestJwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  verifyToken(token: string): GuestJwtPayload {
    return this.jwtService.verify(token);
  }
}
