import { GetGuestAverageStayDurationHandler } from '@/application/guest/queries/get-guest-average-stay-duration/get-guest-average-stay-duration.handler';
import { GetGuestAverageStayDurationQuery } from '@/application/guest/queries/get-guest-average-stay-duration/get-guest-average-stay-duration.query';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';

const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c0';
const GUEST_ID = '65f1a1a2b3c4d5e6f7a8b9c1';

function makeGuest(totalBookings: number, totalNights: number): Guest {
  return {
    getSummary: () => ({ totalBookings, totalNights }),
  } as unknown as Guest;
}

describe('GetGuestAverageStayDurationHandler', () => {
  let guestRepository: ReturnType<typeof createGuestRepositoryMock>;
  let handler: GetGuestAverageStayDurationHandler;

  beforeEach(() => {
    guestRepository = createGuestRepositoryMock();
    handler = new GetGuestAverageStayDurationHandler(guestRepository);
  });

  it('computes totalNights / totalBookings rounded to one decimal', async () => {
    guestRepository.findById.mockResolvedValue(makeGuest(3, 10));

    const result = await handler.execute(
      new GetGuestAverageStayDurationQuery(TENANT_ID, GUEST_ID),
    );

    expect(result).toBe(3.3);
  });

  it('returns 0 when the guest has no completed bookings', async () => {
    guestRepository.findById.mockResolvedValue(makeGuest(0, 0));

    const result = await handler.execute(
      new GetGuestAverageStayDurationQuery(TENANT_ID, GUEST_ID),
    );

    expect(result).toBe(0);
  });

  it('returns 0 when the guest does not exist or the id is invalid', async () => {
    guestRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(new GetGuestAverageStayDurationQuery(TENANT_ID, GUEST_ID)),
    ).resolves.toBe(0);
    await expect(
      handler.execute(new GetGuestAverageStayDurationQuery(TENANT_ID, 'not-an-id')),
    ).resolves.toBe(0);
  });
});
