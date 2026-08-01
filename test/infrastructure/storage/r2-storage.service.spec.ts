import { ConfigService } from '@nestjs/config';
import {
  R2StorageService,
  contentDisposition,
} from '@/infrastructure/storage/r2-storage.service';

const PUBLIC_BUCKET = 'lymon-public';
const DOCUMENTS_BUCKET = 'lymon-guest-documents';

// `null` means "env var absent" — `undefined` would fall back to the default.
const makeService = (documentsBucket: string | null = DOCUMENTS_BUCKET) => {
  const values: Record<string, string | undefined> = {
    R2_ACCOUNT_ID: 'acct123',
    R2_ACCESS_KEY_ID: 'access-key',
    R2_SECRET_ACCESS_KEY: 'secret-key',
    R2_BUCKET_NAME: PUBLIC_BUCKET,
    R2_PUBLIC_URL: 'https://cdn.test',
    R2_DOCUMENTS_BUCKET_NAME: documentsBucket ?? undefined,
  };
  const configService = {
    get: (key: string) => values[key],
  } as unknown as ConfigService;

  return new R2StorageService(configService);
};

const queryParams = (url: string) => new URL(url).searchParams;

describe('contentDisposition', () => {
  it('is inline for the browser-previewable types', () => {
    expect(contentDisposition('passport.pdf', 'application/pdf')).toBe('inline');
    expect(contentDisposition('id.jpg', 'image/jpeg')).toBe('inline');
    expect(contentDisposition('id.heic', 'image/heic')).toBe('inline');
  });

  it('is an attachment with the file name for everything else', () => {
    expect(
      contentDisposition('voucher.docx', 'application/vnd.ms-word'),
    ).toContain('attachment; filename="voucher.docx"');
  });

  it('strips quotes and control characters from the ascii fallback', () => {
    const header = contentDisposition(
      'bad"name\r\nX-Injected: 1.docx',
      'application/octet-stream',
    );

    expect(header).not.toContain('"bad"name');
    expect(header).not.toContain('\r');
    expect(header).not.toContain('\n');
    expect(header).toContain("filename*=UTF-8''");
  });

  it('percent-encodes non-ascii names instead of dropping them', () => {
    const header = contentDisposition('cédula.docx', 'application/msword');

    expect(header).toContain('filename="c_dula.docx"');
    expect(header).toContain("filename*=UTF-8''c%C3%A9dula.docx");
  });
});

describe('R2StorageService', () => {
  describe('generatePresignedGetUrl', () => {
    it('signs against the documents bucket, not the public one', async () => {
      const url = await makeService().generatePresignedGetUrl('tenant/a/id.pdf', {
        fileName: 'id.pdf',
        mimeType: 'application/pdf',
      });

      expect(url).toContain(DOCUMENTS_BUCKET);
      expect(url).not.toContain(PUBLIC_BUCKET);
      expect(url).not.toContain('cdn.test');
    });

    it('defaults to a 5 minute TTL and honours an override', async () => {
      const service = makeService();

      const url = await service.generatePresignedGetUrl('tenant/a/id.pdf', {
        fileName: 'id.pdf',
        mimeType: 'application/pdf',
      });
      expect(queryParams(url).get('X-Amz-Expires')).toBe('300');

      const shortUrl = await service.generatePresignedGetUrl('tenant/a/id.pdf', {
        fileName: 'id.pdf',
        mimeType: 'application/pdf',
        expiresInSeconds: 60,
      });
      expect(queryParams(shortUrl).get('X-Amz-Expires')).toBe('60');
    });

    it('signs the disposition per mime type', async () => {
      const service = makeService();

      const pdf = await service.generatePresignedGetUrl('tenant/a/id.pdf', {
        fileName: 'id.pdf',
        mimeType: 'application/pdf',
      });
      expect(queryParams(pdf).get('response-content-disposition')).toBe('inline');

      const doc = await service.generatePresignedGetUrl('tenant/a/v.docx', {
        fileName: 'v.docx',
        mimeType: 'application/msword',
      });
      expect(queryParams(doc).get('response-content-disposition')).toContain(
        'attachment; filename="v.docx"',
      );
    });

    it('fails loudly when the documents bucket is not configured', async () => {
      await expect(
        makeService(null).generatePresignedGetUrl('k', {
          fileName: 'id.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toThrow('R2_DOCUMENTS_BUCKET_NAME is not configured');
    });
  });

  describe('generatePresignedPutUrl', () => {
    it('uses the public bucket by default so image callers are unchanged', async () => {
      const url = await makeService().generatePresignedPutUrl(
        'tenant/photo.jpg',
        'image/jpeg',
        1024,
      );

      expect(url).toContain(PUBLIC_BUCKET);
      expect(url).not.toContain(DOCUMENTS_BUCKET);
    });

    it('targets the documents bucket when asked', async () => {
      const url = await makeService().generatePresignedPutUrl(
        'tenant/guest-documents/g1/id.pdf',
        'application/pdf',
        1024,
        300,
        'documents',
      );

      expect(url).toContain(DOCUMENTS_BUCKET);
      expect(url).not.toContain(PUBLIC_BUCKET);
    });
  });
});
