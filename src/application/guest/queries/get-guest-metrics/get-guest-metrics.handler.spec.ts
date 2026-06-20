import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { GetGuestMetricsHandler } from './get-guest-metrics.handler';
import { GetGuestMetricsQuery } from './get-guest-metrics.query';
import { RESERVATION_REPOSITORY } from '@/domain/reservation/repositories/reservation.repository';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';

describe('GetGuestMetricsHandler - Avg Nights & Booking Value', () => {
  let handler: GetGuestMetricsHandler;
  let guestRepositoryMock: any;
  let reservationRepositoryMock: any;

  beforeEach(async () => {
    guestRepositoryMock = { findById: jest.fn() };
    reservationRepositoryMock = {
      getBookingValueStats: jest.fn().mockImplementation(() => 
        Promise.resolve({ bookingCount: 0, totalRevenue: 0 })
      )
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetGuestMetricsHandler,
        { provide: GUEST_REPOSITORY, useValue: guestRepositoryMock },
        { provide: RESERVATION_REPOSITORY, useValue: reservationRepositoryMock },
      ],
    }).compile();

    handler = module.get<GetGuestMetricsHandler>(GetGuestMetricsHandler);
  });

  it('should calculate average booking value correctly', async () => {
    const fakeGuest = { getSummary: () => ({ totalBookings: 2, totalNights: 4 }) };
    guestRepositoryMock.findById.mockResolvedValue(fakeGuest);
    
    // Nos aseguramos de que el mock coincida exactamente con el método de la interfaz
    reservationRepositoryMock.getBookingValueStats = jest.fn().mockImplementation(() => 
      Promise.resolve({ bookingCount: 2, totalRevenue: 100000 })
    );

    const query = new GetGuestMetricsQuery('tenant-123', '507f1f77bcf86cd799439011');
    const result = (await handler.execute(query)) as any;

    expect(result.averageBookingValue).toBe(50000);
    expect(result.avgNightsPerStay).toBe(2);
  });
});