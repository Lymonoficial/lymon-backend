import { CartRepository } from '@/domain/cart/repositories/cart.repository';

export function createCartRepositoryMock(): jest.Mocked<CartRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findOpenByGuestAndTenant: jest.fn(),
  };
}
