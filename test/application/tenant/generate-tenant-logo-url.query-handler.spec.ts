import { GenerateTenantLogoUrlQueryHandler } from '@/application/tenant/queries/generate-tenant-logo-url/generate-tenant-logo-url.query-handler';
import { GenerateTenantLogoUrlQuery } from '@/application/tenant/queries/generate-tenant-logo-url/generate-tenant-logo-url.query';
import { GenerateTenantLogoUrlResult } from '@/application/tenant/queries/generate-tenant-logo-url/generate-tenant-logo-url.result';
import { R2StorageService } from '@/infrastructure/storage/r2-storage.service';
import { BadRequestException } from '@nestjs/common';

const PUBLIC_BASE = 'https://cdn.example.com';
const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c2';

describe('GenerateTenantLogoUrlQueryHandler', () => {
  let handler: GenerateTenantLogoUrlQueryHandler;
  let storageService: jest.Mocked<
    Pick<R2StorageService, 'generatePresignedPutUrl' | 'getPublicUrl'>
  >;

  beforeEach(() => {
    storageService = {
      generatePresignedPutUrl: jest.fn().mockResolvedValue('https://r2/put'),
      getPublicUrl: jest.fn((key: string) => `${PUBLIC_BASE}/${key}`),
    };

    handler = new GenerateTenantLogoUrlQueryHandler(
      storageService as unknown as R2StorageService,
    );
  });

  it('builds a key under the tenant logo prefix with the right extension', async () => {
    const result = await handler.execute(
      new GenerateTenantLogoUrlQuery(TENANT_ID, 'image/png', 102400),
    );

    expect(result).toBeInstanceOf(GenerateTenantLogoUrlResult);
    expect(result.key).toMatch(
      new RegExp(`^tenants/${TENANT_ID}/logo/\\d+\\.png$`),
    );
    expect(storageService.generatePresignedPutUrl).toHaveBeenCalledWith(
      result.key,
      'image/png',
      102400,
    );
    expect(result.fileUrl).toBe(`${PUBLIC_BASE}/${result.key}`);
    expect(result.presignedUrl).toBe('https://r2/put');
  });

  it('rejects an unsupported content type', async () => {
    await expect(
      handler.execute(
        new GenerateTenantLogoUrlQuery(TENANT_ID, 'application/pdf', 102400),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storageService.generatePresignedPutUrl).not.toHaveBeenCalled();
  });
});
