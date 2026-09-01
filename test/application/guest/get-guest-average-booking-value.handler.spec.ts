import { GetGuestAverageBookingValueHandler } from '@/application/guest/queries/get-guest-average-booking-value/get-guest-average-booking-value.handler';
import { GetGuestAverageBookingValueQuery } from '@/application/guest/queries/get-guest-average-booking-value/get-guest-average-booking-value.query';
import { createReservationRepositoryMock } from '@test/shared/mocks/repositories/reservation-repository.mock';

const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c0';
const GUEST_ID = '65f1a1a2b3c4d5e6f7a8b9c1';

describe('GetGuestAverageBookingValueHandler', () => {
  let reservationRepository: ReturnType<typeof createReservationRepositoryMock>;
  let handler: GetGuestAverageBookingValueHandler;

  beforeEach(() => {
    reservationRepository = createReservationRepositoryMock();
    handler = new GetGuestAverageBookingValueHandler(reservationRepository);
  });

  it('averages total revenue over valued bookings', async () => {
    reservationRepository.getBookingValueStats.mockResolvedValue({
      totalRevenue: 600000,
      bookingCount: 3,
    });

    const result = await handler.execute(
      new GetGuestAverageBookingValueQuery(TENANT_ID, GUEST_ID),
    );

    expect(result).toBe(200000);
    expect(reservationRepository.getBookingValueStats).toHaveBeenCalledWith(
      TENANT_ID,
      GUEST_ID,
    );
  });

  it('rounds to a whole integer COP', async () => {
    reservationRepository.getBookingValueStats.mockResolvedValue({
      totalRevenue: 100001,
      bookingCount: 2,
    });

    await expect(
      handler.execute(new GetGuestAverageBookingValueQuery(TENANT_ID, GUEST_ID)),
    ).resolves.toBe(50001);
  });

  it('returns 0 when the guest has no valued bookings', async () => {
    reservationRepository.getBookingValueStats.mockResolvedValue({
      totalRevenue: 0,
      bookingCount: 0,
    });

    await expect(
      handler.execute(new GetGuestAverageBookingValueQuery(TENANT_ID, GUEST_ID)),
    ).resolves.toBe(0);
  });

  it('returns 0 for an invalid guest id without hitting the repository', async () => {
    await expect(
      handler.execute(new GetGuestAverageBookingValueQuery(TENANT_ID, 'nope')),
    ).resolves.toBe(0);
    expect(reservationRepository.getBookingValueStats).not.toHaveBeenCalled();
  });
});
