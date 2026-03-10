import { IGuestTokenService } from '@/application/guest-auth/services/guest-jwt.service';

export function createGuestTokenServiceMock(): jest.Mocked<IGuestTokenService> {
  return {
    generateAccessToken: jest.fn().mockReturnValue('guest-access-token'),
    generateRefreshToken: jest.fn().mockReturnValue('guest-refresh-token'),
    verifyToken: jest.fn(),
  };
}
