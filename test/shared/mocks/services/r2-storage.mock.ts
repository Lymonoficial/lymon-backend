import { R2StorageService } from '@/infrastructure/storage/r2-storage.service';

export function createR2StorageServiceMock(): jest.Mocked<
  Pick<R2StorageService, 'generatePresignedPutUrl' | 'getPublicUrl'>
> {
  return {
    generatePresignedPutUrl: jest.fn(),
    getPublicUrl: jest.fn(),
  };
}
