import { GetGuestBookingsHandler } from '@/application/guest/queries/get-guest-bookings/get-guest-bookings.handler';
import { GetGuestBookingsQuery } from '@/application/guest/queries/get-guest-bookings/get-guest-bookings.query';
import { createReservationRepositoryMock } from '@test/shared/mocks/repositories/reservation-repository.mock';
import { makeReservation } from '@test/shared/fixtures/reservation.fixture';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';
import { ReservationSourceEnum } from '@/domain/reservation/value-objects/reservation-source.vo';

describe('GetGuestBookingsHandler', () => {
  let handler: GetGuestBookingsHandler;
  let reservationRepository: ReturnType<typeof createReservationRepositoryMock>;

  beforeEach(() => {
    reservationRepository = createReservationRepositoryMock();
    handler = new GetGuestBookingsHandler(reservationRepository as any);
  });

  describe('UT-01: Mapeo correcto de entidad a DTO', () => {
    it('should map reservation entity to DTO correctly', async () => {
      const reservation = makeReservation({
        totalPrice: 450.5,
        status: ReservationStatusEnum.CONFIRMED,
        source: ReservationSourceEnum.AIRBNB,
      });
      reservationRepository.findByGuestId.mockResolvedValue([reservation]);

      const query = new GetGuestBookingsQuery('65f1a1a2b3c4d5e6f7a8b9c2', '65f1a1a2b3c4d5e6f7a8b9c0');
      const result = await handler.execute(query);

      expect(result.items).toHaveLength(1);
      const dto = result.items[0];
      expect(typeof dto.totalAmount).toBe('number');
      expect(dto.totalAmount).toBe(450.5);
      expect(typeof dto.status).toBe('string');
      expect(dto.status).toBe(ReservationStatusEnum.CONFIRMED);
      expect(typeof dto.source).toBe('string');
      expect(dto.source).toBe(ReservationSourceEnum.AIRBNB);
    });
  });

  describe('UT-02: Filtrado por Tenant estricto', () => {
    it('should only return bookings belonging to the requested tenant', async () => {
      const resA = makeReservation({ tenantId: 'tenant-A' });
      const resB = makeReservation({ tenantId: 'tenant-B' });
      
      // Simulating a "messy" repository that returns both
      reservationRepository.findByGuestId.mockResolvedValue([resA, resB]);

      const query = new GetGuestBookingsQuery('tenant-A', '65f1a1a2b3c4d5e6f7a8b9c0');
      const result = await handler.execute(query);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(resA.getId()!.toString());
    });
  });

  describe('UT-03: Manejo de GuestId inválido', () => {
    it('should return empty list if guestId is not a valid UUID', async () => {
      const query = new GetGuestBookingsQuery('tenant-1', 'invalid-uuid');
      const result = await handler.execute(query);

      expect(result.items).toEqual([]);
      expect(reservationRepository.findByGuestId).not.toHaveBeenCalled();
    });
  });

  describe('UT-04: Lista vacía cuando no hay reservas', () => {
    it('should return empty list if no bookings are found', async () => {
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const query = new GetGuestBookingsQuery('65f1a1a2b3c4d5e6f7a8b9c2', '65f1a1a2b3c4d5e6f7a8b9c0');
      const result = await handler.execute(query);

      expect(result.items).toEqual([]);
    });
  });

  describe('UT-05: Orden descendente por creación', () => {
    it('should return bookings sorted by creation date descending', async () => {
      const jan = new Date('2024-01-01');
      const may = new Date('2024-05-01');
      
      const resJan = makeReservation({ createdAt: jan, id: 'jan-id' });
      const resMay = makeReservation({ createdAt: may, id: 'may-id' });

      // Mocking repo returning unsorted or different order
      reservationRepository.findByGuestId.mockResolvedValue([resJan, resMay]);

      const query = new GetGuestBookingsQuery('65f1a1a2b3c4d5e6f7a8b9c2', '65f1a1a2b3c4d5e6f7a8b9c0');
      const result = await handler.execute(query);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('may-id');
      expect(result.items[1].id).toBe('jan-id');
    });
  });
});
