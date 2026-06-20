import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetGuestMetricsHandler } from './get-guest-metrics.handler';
import { GetGuestMetricsQuery } from './get-guest-metrics.query';
import { RESERVATION_REPOSITORY} from '@/domain/reservation/repositories/reservation.repository';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('GetGuestMetricsHandler', () => {
  let handler: GetGuestMetricsHandler;
  let guestRepositoryMock: any;
  let reservationRepositoryMock: any;

  beforeEach(async () => {
    guestRepositoryMock = {
      findById: jest.fn(),
    };
    reservationRepositoryMock = {
      getBookingValueStats: jest.fn().mockImplementation(() => 
        Promise.resolve({ bookingCount: 0, totalRevenue: 0 })
      ),
      getLastStayAt: jest.fn(),
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

  it('should calculate daysSinceLastStay correctly for a normal completed stay', async () => {
    const fakeGuest = {
      getSummary: () => ({ totalBookings: 1, totalNights: 2 }),
    };
    guestRepositoryMock.findById.mockResolvedValue(fakeGuest);

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    reservationRepositoryMock.getLastStayAt.mockResolvedValue(fiveDaysAgo);

   // Escenario 1 (Caso Normal): Cambiar 'guest-456' por un ID de 24 caracteres
  const query = new GetGuestMetricsQuery('tenant-123', '507f1f77bcf86cd799439011');
    const result = await handler.execute(query);

    expect(result.lastStayAt).toBe(fiveDaysAgo.toISOString());
    expect(result.daysSinceLastStay).toBe(5);
  });

  it('should return null for lastStayAt and daysSinceLastStay if guest has no completed stays', async () => {
    const fakeGuest = {
      getSummary: () => ({ totalBookings: 0, totalNights: 0 }),
    };
    guestRepositoryMock.findById.mockResolvedValue(fakeGuest);
    
    reservationRepositoryMock.getLastStayAt.mockResolvedValue(null);

// Escenario 2 (Sin Estancias): Igual, cambiar 'guest-456'
  const query = new GetGuestMetricsQuery('tenant-123', '507f1f77bcf86cd799439012');    const result = await handler.execute(query);

    expect(result.lastStayAt).toBeNull();
    expect(result.daysSinceLastStay).toBeNull();
  });

  it('should clamp daysSinceLastStay to 0 if the checkout date is today or slightly ahead due to server time', async () => {
    const fakeGuest = {
      getSummary: () => ({ totalBookings: 1, totalNights: 1 }),
    };
    guestRepositoryMock.findById.mockResolvedValue(fakeGuest);

    const justNow = new Date();
    reservationRepositoryMock.getLastStayAt.mockResolvedValue(justNow);

// Escenario 3 (Límite a Cero): Igual, cambiar 'guest-456'
  const query = new GetGuestMetricsQuery('tenant-123', '507f1f77bcf86cd799439013');    const result = await handler.execute(query);

    expect(result.daysSinceLastStay).toBe(0);
  });

  it('should throw a NotFoundException if the guest does not exist', async () => {
    guestRepositoryMock.findById.mockResolvedValue(null);

// Escenario 4 (Huésped no existe): Cambiar 'guest-invalid'
  const query = new GetGuestMetricsQuery('tenant-123', '507f1f77bcf86cd799439014');
    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });
});