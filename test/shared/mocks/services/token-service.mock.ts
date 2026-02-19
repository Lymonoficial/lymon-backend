import { ITokenService } from '@/application/auth/services/jwt.service';

export function createTokenServiceMock(): jest.Mocked<ITokenService> {
  return {
    generateAccesToken: jest.fn().mockReturnValue('access-token'),
    generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
    verifyToken: jest.fn(),
  };
}
