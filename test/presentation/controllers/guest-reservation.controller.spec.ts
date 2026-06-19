import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GuestReservationController } from '@/presentation/controllers/guest-reservation.controller';
import { GetGuestReservationsQuery } from '@/application/reservation/queries/get-guest-reservations/get-guest-reservations.query';
import { GetGuestReservationQuery } from '@/application/reservation/queries/get-guest-reservation/get-guest-reservation.query';
import { GetGuestReservationsResult } from '@/application/reservation/queries/get-guest-reservations/get-guest-reservations.result';

describe('GuestReservationController', () => {
  let controller: GuestReservationController;
  let commandBus: { execute: jest.Mock };
  let queryBus: { execute: jest.Mock };

  const guest = {
    guestAccountId: '65f1a1a2b3c4d5e6f7a8b9c5',
    email: 'guest@example.com',
  } as any;

  beforeEach(() => {
    queryBus = { execute: jest.fn() };
    controller = new GuestReservationController(
      queryBus as unknown as QueryBus,
    );
  });

  it('lists guest bookings with pagination and filters', async () => {
    queryBus.execute.mockResolvedValue(
      new GetGuestReservationsResult([], 0, 1, 20),
    );

    const queryParams = {
      page: '2',
      limit: '15',
      status: 'completed',
      fromDate: '2026-01-01',
      toDate: '2026-02-01',
      sortBy: 'createdAt' as const,
      sortOrder: 'desc' as const,
    };

    const result = await controller.findAll(guest, queryParams);

    expect(queryBus.execute).toHaveBeenCalledWith(
      expect.any(GetGuestReservationsQuery),
    );
    const [query] = queryBus.execute.mock.calls[0] as [
      GetGuestReservationsQuery,
    ];
    expect(query).toMatchObject({
      guestAccountId: '65f1a1a2b3c4d5e6f7a8b9c5',
      page: 2,
      limit: 15,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(result).toEqual(new GetGuestReservationsResult([], 0, 1, 20));
  });

  it('opens booking detail for the authenticated guest account', async () => {
    queryBus.execute.mockResolvedValue({ id: '65f1a1a2b3c4d5e6f7a8b9c3' });

    const result = await controller.findOne(guest, '65f1a1a2b3c4d5e6f7a8b9c3');

    expect(queryBus.execute).toHaveBeenCalledWith(
      expect.any(GetGuestReservationQuery),
    );
    const query = queryBus.execute.mock.calls[0][0] as GetGuestReservationQuery;
    expect(query).toMatchObject({
      reservationId: '65f1a1a2b3c4d5e6f7a8b9c3',
      guestAccountId: '65f1a1a2b3c4d5e6f7a8b9c5',
    });
    expect(result).toEqual({ id: '65f1a1a2b3c4d5e6f7a8b9c3' });
  });
});
