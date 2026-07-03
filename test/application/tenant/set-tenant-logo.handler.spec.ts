import {
  SetTenantLogoHandler,
  SetTenantLogoResult,
} from '@/application/tenant/commands/set-tenant-logo/set-tenant-logo.handler';
import { SetTenantLogoCommand } from '@/application/tenant/commands/set-tenant-logo/set-tenant-logo.command';
import { TenantRepository } from '@/domain/tenant/repositories/tenant.repository';
import { R2StorageService } from '@/infrastructure/storage/r2-storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createTenantRepositoryMock } from '@test/shared/mocks/repositories/tenant-repository.mock';
import { createEventEmitterMock } from '@test/shared/mocks/services/event-emitter.mock';
import {
  makeTenant,
  TENANT_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/tenant.fixture';

const PUBLIC_BASE = 'https://cdn.example.com';
const TENANT_ID = TENANT_FIXTURE_DEFAULTS.id;
const KEY = `tenants/${TENANT_ID}/logo/222.png`;
const ACTOR_ID = '65f1a1a2b3c4d5e6f7a8b9c1';
const ACTOR_EMAIL = 'owner@example.com';

describe('SetTenantLogoHandler', () => {
  let handler: SetTenantLogoHandler;
  let tenantRepository: jest.Mocked<TenantRepository>;
  let storageService: jest.Mocked<
    Pick<R2StorageService, 'deleteObjects' | 'getPublicUrl'>
  >;
  let eventEmitter: ReturnType<typeof createEventEmitterMock>;

  beforeEach(() => {
    tenantRepository = createTenantRepositoryMock();
    storageService = {
      deleteObjects: jest.fn(),
      getPublicUrl: jest.fn((key: string) => `${PUBLIC_BASE}/${key}`),
    };
    eventEmitter = createEventEmitterMock();

    handler = new SetTenantLogoHandler(
      tenantRepository,
      storageService as unknown as R2StorageService,
      eventEmitter as any,
    );
  });

  it('rejects a key outside the tenant own prefix', async () => {
    await expect(
      handler.execute(
        new SetTenantLogoCommand(
          TENANT_ID,
          'tenants/someone-else/logo/1.png',
          ACTOR_ID,
          ACTOR_EMAIL,
        ),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tenantRepository.findById).not.toHaveBeenCalled();
  });

  it('rejects an unknown tenant', async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(
        new SetTenantLogoCommand(TENANT_ID, KEY, ACTOR_ID, ACTOR_EMAIL),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('stores the key, returns the public URL and emits an audit event', async () => {
    tenantRepository.findById.mockResolvedValue(makeTenant());

    const result = await handler.execute(
      new SetTenantLogoCommand(TENANT_ID, KEY, ACTOR_ID, ACTOR_EMAIL),
    );

    expect(result).toBeInstanceOf(SetTenantLogoResult);
    const saved = tenantRepository.save.mock.calls[0][0];
    expect(saved.getLogoKey()).toBe(KEY);
    expect(result.logoUrl).toBe(`${PUBLIC_BASE}/${KEY}`);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ entityType: 'TENANT' }),
    );
  });

  it('deletes the previous logo after committing the new one', async () => {
    const oldKey = `tenants/${TENANT_ID}/logo/111.jpg`;
    tenantRepository.findById.mockResolvedValue(
      makeTenant({ logoKey: oldKey }),
    );

    await handler.execute(
      new SetTenantLogoCommand(TENANT_ID, KEY, ACTOR_ID, ACTOR_EMAIL),
    );

    expect(storageService.deleteObjects).toHaveBeenCalledWith([oldKey]);
  });

  it('does not delete anything on the first upload', async () => {
    tenantRepository.findById.mockResolvedValue(makeTenant({ logoKey: null }));

    await handler.execute(
      new SetTenantLogoCommand(TENANT_ID, KEY, ACTOR_ID, ACTOR_EMAIL),
    );

    expect(storageService.deleteObjects).not.toHaveBeenCalled();
  });
});
