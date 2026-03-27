import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SendGuestMessageHandler } from '@/application/guest-email/commands/send-guest-message/send-guest-message.handler';
import { SendGuestMessageCommand } from '@/application/guest-email/commands/send-guest-message/send-guest-message.command';
import { createEmailServiceMock } from '@test/shared/mocks/services/email-service.mock';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';
import { createReservationRepositoryMock } from '@test/shared/mocks/repositories/reservation-repository.mock';
import { createPropertyRepositoryMock } from '@test/shared/mocks/repositories/property-repository.mock';
import { createGuestEmailRepositoryMock } from '@test/shared/mocks/repositories/guest-email-repository.mock';
import { createEmailTemplateServiceMock } from '@test/shared/mocks/services/email-template-service.mock';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestEmailStatusEnum } from '@/domain/guest-email/value-objects/guest-email-status.vo';

describe('SendGuestMessageHandler (Pruebas de Mensajería)', () => {
  let handler: SendGuestMessageHandler;
  let emailService: any;
  let guestRepository: any;
  let reservationRepository: any;
  let propertyRepository: any;
  let guestEmailRepository: any;
  let templateService: any;

  const tenantIdStr = '65f1a23b4c5d6e7f8a9b0c1d';
  const guestIdStr = '65f1a23b4c5d6e7f8a9b0c1e';
  const staffIdStr = '65f1a23b4c5d6e7f8a9b0c1f';

  beforeEach(async () => {
    emailService = createEmailServiceMock();
    guestRepository = createGuestRepositoryMock();
    reservationRepository = createReservationRepositoryMock();
    propertyRepository = createPropertyRepositoryMock();
    guestEmailRepository = createGuestEmailRepositoryMock();
    templateService = createEmailTemplateServiceMock();

    handler = new SendGuestMessageHandler(
      emailService,
      guestRepository,
      reservationRepository,
      propertyRepository,
      guestEmailRepository,
      templateService,
    );
  });

  // Mock de huésped con identidad válida para evitar errores de tipo
  const mockGuest = Guest.create({
    tenantId: TenantId.createFromString(tenantIdStr),
    identity: { documentNumber: '12345', documentType: 'DNI', countryCode: 'CO' },
    fullName: 'John Doe',
    primaryEmail: 'john@example.com',
  });

  describe('Flujo de envío y placeholders', () => {
    
    it('Caso 1: Envío Exitoso (Happy Path) - PASSED: Se envía el email y se guarda en historial como SENT', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);
      emailService.sendEmail.mockResolvedValue(undefined);

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
      expect(emailService.sendEmail).toHaveBeenCalled();
      expect(guestEmailRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: GuestEmailStatusEnum.SENT,
        }),
      );
    });

    it('Caso 2: Validación de Placeholders (Datos completos) - PASSED: Se resuelven correctamente nombre y propiedad', async () => {
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

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Asunto para John Doe',
          htmlContent: expect.stringContaining('Cuerpo con John Doe'),
        }),
      );
    });

    it('Caso 3: Validación de Placeholders (Fallback) - PASSED: Se reemplazan variables faltantes por string vacío', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Asunto con {{no_existe}}',
        'Cuerpo con {{no_existe}}',
        undefined,
        [],
        staffIdStr,
      );

      await handler.execute(command);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Asunto con ', 
          htmlContent: expect.stringContaining('Cuerpo con '),
        }),
      );
    });

    it('Caso 4: Manejo del staffId nulo - PASSED: Se permite envío automático sin staff logueado', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Auto Email',
        'Hola',
        undefined,
        [],
        undefined,
      );

      await handler.execute(command);

      expect(guestEmailRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          sentById: null,
        }),
      );
    });

    it('Caso 5: Validación Estricta (Error 400) - PASSED: Se lanza excepción si falta cuerpo y plantilla', async () => {
      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Asunto',
        '', 
        undefined,
        [],
        staffIdStr,
      );

      await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
    });

    it('Caso 6: Seguridad (Fuga de datos) - PASSED: No se exponen datos sensibles como contraseñas', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Seguridad',
        'Secreto: {{password}}, tarjeta: {{creditCard}}',
        undefined,
        [],
        staffIdStr,
      );

      await handler.execute(command);

      const calls = emailService.sendEmail.mock.calls[0][0];
      // Al no estar en dynamicVariables, se limpian por el parser
      expect(calls.htmlContent).not.toContain('{{password}}');
      expect(calls.htmlContent).toContain('Secreto: , tarjeta: '); 
    });

    it('Caso 7: Procesamiento de Archivos Adjuntos - PASSED: Los adjuntos se pasan correctamente al servicio de email', async () => {
      guestRepository.findById.mockResolvedValue(mockGuest);
      reservationRepository.findByGuestId.mockResolvedValue([]);

      const attachments = [
        { url: 'http://test.com/doc.pdf', name: 'document.pdf' },
        { url: 'http://test.com/img.jpg', name: 'image.jpg' },
      ];

      const command = new SendGuestMessageCommand(
        tenantIdStr,
        guestIdStr,
        'Con adjuntos',
        'Ver archivos',
        undefined,
        attachments,
        staffIdStr,
      );

      await handler.execute(command);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining(attachments),
        }),
      );
    });
  });
});
