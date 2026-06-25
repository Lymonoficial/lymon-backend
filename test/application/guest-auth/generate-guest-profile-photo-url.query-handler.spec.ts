import { GenerateGuestProfilePhotoUrlQueryHandler } from '@/application/guest-auth/queries/generate-guest-profile-photo-url/generate-guest-profile-photo-url.query-handler';
import { GenerateGuestProfilePhotoUrlQuery } from '@/application/guest-auth/queries/generate-guest-profile-photo-url/generate-guest-profile-photo-url.query';
import { GenerateGuestProfilePhotoUrlResult } from '@/application/guest-auth/queries/generate-guest-profile-photo-url/generate-guest-profile-photo-url.result';
import { R2StorageService } from '@/infrastructure/storage/r2-storage.service';
import { BadRequestException } from '@nestjs/common';

const PUBLIC_BASE = 'https://cdn.example.com';
const ACCOUNT_ID = '65f1a1a2b3c4d5e6f7a8b9c5';

describe('GenerateGuestProfilePhotoUrlQueryHandler', () => {
  let handler: GenerateGuestProfilePhotoUrlQueryHandler;
  let storageService: jest.Mocked<
    Pick<R2StorageService, 'generatePresignedPutUrl' | 'getPublicUrl'>
  >;

  beforeEach(() => {
    storageService = {
      generatePresignedPutUrl: jest.fn().mockResolvedValue('https://r2/put'),
      getPublicUrl: jest.fn((key: string) => `${PUBLIC_BASE}/${key}`),
    };

    handler = new GenerateGuestProfilePhotoUrlQueryHandler(
      storageService as unknown as R2StorageService,
    );
  });

  it('builds a key under the guest profile prefix with the right extension', async () => {
    const result = await handler.execute(
      new GenerateGuestProfilePhotoUrlQuery(ACCOUNT_ID, 'image/webp'),
    );

    expect(result).toBeInstanceOf(GenerateGuestProfilePhotoUrlResult);
    expect(result.key).toMatch(
      new RegExp(`^guests/${ACCOUNT_ID}/profile/\\d+\\.webp$`),
    );
    expect(storageService.generatePresignedPutUrl).toHaveBeenCalledWith(
      result.key,
      'image/webp',
    );
    expect(result.fileUrl).toBe(`${PUBLIC_BASE}/${result.key}`);
    expect(result.presignedUrl).toBe('https://r2/put');
  });

  it('rejects an unsupported content type', async () => {
    await expect(
      handler.execute(
        new GenerateGuestProfilePhotoUrlQuery(ACCOUNT_ID, 'application/pdf'),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storageService.generatePresignedPutUrl).not.toHaveBeenCalled();
  });
});
