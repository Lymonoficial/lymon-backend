import { GuestLifecycleStatus } from '@/domain/guest/value-objects/guest-lifecycle-status.vo';
import { GuestReservationsReadRepository } from '@/domain/reservation/repositories/guest-reservations-read.repository';

export function createGuestReservationsReadRepositoryMock(): jest.Mocked<GuestReservationsReadRepository> {
  return {
    findByGuestIds: jest.fn(),
    countByGuestIds: jest.fn(),
    getLifecycleStatusByGuestIds: jest.fn().mockResolvedValue(new Map()),
  };
}
