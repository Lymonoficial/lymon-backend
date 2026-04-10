import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendGuestMessageHandler } from '@/application/guest-email/commands/send-guest-message/send-guest-message.handler';
import { SendGuestMessageCommand } from '@/application/guest-email/commands/send-guest-message/send-guest-message.command';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';
import { createReservationRepositoryMock } from '@test/shared/mocks/repositories/reservation-repository.mock';
import { createPropertyRepositoryMock } from '@test/shared/mocks/repositories/property-repository.mock';
import { createGuestEmailRepositoryMock } from '@test/shared/mocks/repositories/guest-email-repository.mock';
import { createEmailTemplateServiceMock } from '@test/shared/mocks/services/email-template-service.mock';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestEmailStatusEnum } from '@/domain/guest-email/value-objects/guest-email-status.vo';
import { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { ReservationRepository } from '@/domain/reservation/repositories/reservation.repository';
import { PropertyRepository } from '@/domain/property/repositories/property.repository';
import { GuestEmailRepository } from '@/domain/guest-email/repositories/guest-email.repository';
import { EmailTemplateService } from '@/infrastructure/common/email-template.service';

// SOLUCIÓN PARA UUID: Mockeamos la librería para evitar errores de sintaxis ESM
jest.mock('uuid', () => ({
  v4: () => 'fb7da327-3d7d-4dc5-8929-6ba3d26f24b8',
}));

describe('SendGuestMessageHandler (Pruebas Completas de Mensajería)', () => {
  let handler: SendGuestMessageHandler;
  let guestRepository: jest.Mocked<GuestRepository>;
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let propertyRepository: jest.Mocked<PropertyRepository>;
  let guestEmailRepository: jest.Mocked<GuestEmailRepository>;
  let templateService: jest.Mocked<EmailTemplateService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const tenantIdStr = '65f1a23b4c5d6e7f8a9b0c1d';
  const guestIdStr = '65f1a23b4c5d6e7f8a9b0c1e';
  const staffIdStr = '65f1a23b4c5d6e7f8a9b0c1f';

  beforeEach(() => {
    guestRepository = createGuestRepositoryMock();
    reservationRepository = createReservationRepositoryMock();
    propertyRepository = createPropertyRepositoryMock();
    guestEmailRepository = createGuestEmailRepositoryMock();
    templateService = createEmailTemplateServiceMock();

    eventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    handler = new SendGuestMessageHandler(
      guestRepository,
      reservationRepository,
      propertyRepository,
      guestEmailRepository,
      templateService,
      eventEmitter,
    );
  });

  const mockGuest = Guest.create({
    tenantId: TenantId.createFromString(tenantIdStr),
    identity: {
      documentNumber: '12345',
      documentType: 'DNI',
      countryCode: 'CO',
    },
    fullName: 'John Doe',
    primaryEmail: 'john@example.com',
  });

  describe('Flujo de envío asíncrono y placeholders', () => {
    it('Caso 1: Envío Exitoso (Happy Path) - Se guarda en PENDING y emite evento', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Bienvenido',
        'Mensaje de prueba',
        undefined,
        [],
        staffIdStr,
      );

      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(guestEmailRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: GuestEmailStatusEnum.PENDING }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'guest-email.created',
        expect.anything(),
      );
    });

    it('Caso 2: Validación de Placeholders (Datos completos) - Se resuelven correctamente nombre y propiedad', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Asunto para {{guestName}}',
        'Cuerpo con {{guestName}}',
        undefined,
        [],
        staffIdStr,
      );

      await handler.execute(command);

      const event = eventEmitter.emit.mock.calls[0][1];
      expect(event.subject).toBe('Asunto para John Doe');
      expect(event.body).toContain('Cuerpo con John Doe');
    });

    it('Caso 3: Validación de Placeholders (Fallback) - Se reemplazan variables faltantes por string vacío', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Asunto {{missing}}',
        'Cuerpo {{missing}}',
        undefined,
        [],
        staffIdStr,
      );

      await handler.execute(command);

      const event = eventEmitter.emit.mock.calls[0][1];
      expect(event.body).toContain('Cuerpo ');
    });

    it('Caso 4: Manejo del staffId nulo - Permite envío automático sin staff logueado', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Auto',
        'Hola',
        undefined,
        [],
        undefined,
      );

      await handler.execute(command);

      const savedEntity = guestEmailRepository.save.mock.calls[0][0];
      expect(savedEntity.getSentById()).toBeNull();
    });

    it('Caso 5: Validación Estricta (Error 400) - Lanza excepción si falta cuerpo y plantilla', async () => {
      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Sub',
        '',
        undefined,
        [],
        staffIdStr,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('Caso 6: Seguridad (Fuga de datos) - No se exponen datos sensibles', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Seguridad',
        'Pass: {{password}}',
        undefined,
        [],
        staffIdStr,
      );

      await handler.execute(command);

      const event = eventEmitter.emit.mock.calls[0][1];
      expect(event.body).not.toContain('{{password}}');
      expect(event.body).toContain('Pass: ');
    });

    it('Caso 7: Procesamiento de Archivos Adjuntos - Se pasan correctamente al historial', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const attachments = [{ url: 'http://test.com/doc.pdf', name: 'doc.pdf' }];
      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Adj',
        'Txt',
        undefined,
        attachments,
        staffIdStr,
      );

      await handler.execute(command);

      const savedEntity = guestEmailRepository.save.mock.calls[0][0];
      expect(savedEntity.getAttachments()).toEqual(attachments);
    });

    it('Caso 8: Validación de Emisión de Eventos - El evento lleva el senderName de la propiedad', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);

      const mockReservation = {
        getPropertyId: () => ({ toString: () => 'prop123' }),
        getDateRange: () => ({
          getCheckIn: () => new Date('2024-10-01T12:00:00Z'),
          getCheckOut: () => new Date('2024-10-10T12:00:00Z'),
        }),
      } as any;
      const mockProperty = { getName: () => 'Hotel Paraíso' } as any;

      reservationRepository.findByGuestId.mockResolvedValue([mockReservation]);
      propertyRepository.findById.mockResolvedValue(mockProperty);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Tu reserva',
        'En {{propertyName}}',
        undefined,
        [],
        staffIdStr,
      );

      await handler.execute(command);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'guest-email.created',
        expect.objectContaining({ senderName: 'Hotel Paraíso' }),
      );
    });

    it('Caso 9: Verificación de Estado PENDING inicial - Fiabilidad de envío', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);
      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'A',
        'B',
        undefined,
        [],
        staffIdStr,
      );
      await handler.execute(command);
      const savedEntity = guestEmailRepository.save.mock.calls[0][0];
      expect(savedEntity.getStatus()).toBe(GuestEmailStatusEnum.PENDING);
    });

    it('Caso 10: Inyección de Datos de Reserva - Placeholders de fechas y nombre', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      const checkInDate = new Date('2024-10-01T12:00:00Z');
      const mockReservation = {
        getPropertyId: () => ({ toString: () => 'prop123' }),
        getDateRange: () => ({
          getCheckIn: () => checkInDate,
          getCheckOut: () => new Date(),
        }),
      } as any;
      const mockProperty = { getName: () => 'Hostal Central' } as any;

      reservationRepository.findByGuestId.mockResolvedValue([mockReservation]);
      propertyRepository.findById.mockResolvedValue(mockProperty);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'D',
        'Check-in: {{checkInDate}}',
        undefined,
        [],
        staffIdStr,
      );

      await handler.execute(command);

      const emitCall = eventEmitter.emit.mock.calls[0][1];
      expect(emitCall.body).toContain(checkInDate.toLocaleDateString());
    });
  });
});
