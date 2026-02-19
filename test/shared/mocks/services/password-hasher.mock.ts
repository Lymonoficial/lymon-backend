import { IPasswordHasher } from '@/application/auth/services/password-hasher.service';

export function createPasswordHasherMock(): jest.Mocked<IPasswordHasher> {
  return {
    hash: jest.fn(),
    compare: jest.fn(),
  };
}
