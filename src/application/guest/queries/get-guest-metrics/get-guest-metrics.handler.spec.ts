import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetGuestMetricsHandler } from '@/application/guest/queries/get-guest-metrics/get-guest-metrics.handler';
import { GetGuestMetricsQuery } from '@/application/guest/queries/get-guest-metrics/get-guest-metrics.query';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';
import { RESERVATION_REPOSITORY } from '@/domain/reservation/repositories/reservation.repository';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

describe('GetGuestMetricsHandler', () => {
  let handler: GetGuestMetricsHandler;
  
  const mockGuestRepository = {
    findById: jest.fn<any>(),
  };

  const mockReservationRepository = {
    getBookingValueStats: jest.fn<any>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetGuestMetricsHandler,
        { provide: GUEST_REPOSITORY, useValue: mockGuestRepository },
        { provide: RESERVATION_REPOSITORY, useValue: mockReservationRepository },
      ],
    }).compile();

    handler = module.get<GetGuestMetricsHandler>(GetGuestMetricsHandler);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if guest does not exist', async () => {
    mockGuestRepository.findById.mockResolvedValue(null);
    const query = new GetGuestMetricsQuery('65f1a1a2b3c4d5e6f7a8b900', '65f1a1a2b3c4d5e6f7a8b901');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('should return all metrics when no type is specified', async () => {
    const mockGuest = {
      getSummary: () => ({ totalBookings: 5, totalNights: 10 }),
    };
    mockGuestRepository.findById.mockResolvedValue(mockGuest);
    
    mockReservationRepository.getBookingValueStats.mockResolvedValue({
      totalRevenue: 500,
      bookingCount: 2,
    });

    const query = new GetGuestMetricsQuery('65f1a1a2b3c4d5e6f7a8b900', '65f1a1a2b3c4d5e6f7a8b902'); 
    const result = await handler.execute(query);

    expect(result.totalBookings).toBe(5);
    expect(result.totalNights).toBe(10);
    expect(result.avgNightsPerStay).toBe(2); 
    expect(result.averageBookingValue).toBe(250); 
  });

  it('should calculate only booking value and skip others if type is averageBookingValue', async () => {
    const mockGuest = {
      getSummary: () => ({ totalBookings: 5, totalNights: 10 }),
    };
    mockGuestRepository.findById.mockResolvedValue(mockGuest);
    
    mockReservationRepository.getBookingValueStats.mockResolvedValue({
      totalRevenue: 600,
      bookingCount: 3,
    });

    const query = new GetGuestMetricsQuery('65f1a1a2b3c4d5e6f7a8b900', '65f1a1a2b3c4d5e6f7a8b902', 'averageBookingValue');
    const result = await handler.execute(query);

    expect(result.totalBookings).toBe(0);
    expect(result.totalNights).toBe(0);
    expect(result.avgNightsPerStay).toBe(0);
    expect(result.averageBookingValue).toBe(200); 
  });
});