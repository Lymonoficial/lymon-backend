import { NotFoundException } from '@nestjs/common';
import { UpdateTenantProfileHandler } from '@/application/tenant/commands/update-tenant-profile.handler';
import { UpdateTenantProfileCommand } from '@/application/tenant/commands/update-tenant-profile.command';
import { UpdateTenantProfileResult } from '@/application/tenant/commands/update-tenant-profile.result';
import { TenantRepository } from '@/domain/tenant/repositories/tenant.repository';
import { createTenantRepositoryMock } from '@test/shared/mocks/repositories/tenant-repository.mock';
import { createEventEmitterMock } from '@test/shared/mocks/services/event-emitter.mock';
import {
  makeTenant,
  TENANT_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/tenant.fixture';

describe('UpdateTenantProfileHandler', () => {
  let handler: UpdateTenantProfileHandler;
  let tenantRepository: jest.Mocked<TenantRepository>;
  let eventEmitter: ReturnType<typeof createEventEmitterMock>;

  beforeEach(() => {
    tenantRepository = createTenantRepositoryMock();
    eventEmitter = createEventEmitterMock();

    handler = new UpdateTenantProfileHandler(
      tenantRepository,
      eventEmitter as any,
    );
  });

  describe('when the tenant does not exist', () => {
    it('throws NotFoundException', async () => {
      tenantRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(
          new UpdateTenantProfileCommand(
            'non-existent',
            'New Name',
            null,
            null,
            null,
            null,
            'user-456',
            'owner@example.com',
          ),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('when the tenant exists', () => {
    it('updates the profile, saves, and emits audit event', async () => {
      tenantRepository.findById.mockResolvedValue(makeTenant());

      const result = await handler.execute(
        new UpdateTenantProfileCommand(
          TENANT_FIXTURE_DEFAULTS.id,
          'Updated Corp',
          '+573009999999',
          'New Address 456',
          'https://updated.com',
          'https://logo.updated.com/img.png',
          'user-456',
          'owner@example.com',
        ),
      );

      expect(result).toBeInstanceOf(UpdateTenantProfileResult);
      expect(result.tenantId).toBe(TENANT_FIXTURE_DEFAULTS.id);
      expect(tenantRepository.save).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ entityType: 'TENANT' }),
      );
    });
  });
});
