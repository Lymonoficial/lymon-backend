import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const R2_STORAGE_SERVICE = 'R2_STORAGE_SERVICE';

/**
 * `public` is the world-readable bucket behind R2_PUBLIC_URL (images).
 * `documents` is a separate bucket with public access disabled: personal data
 * (IDs, passports) lives there and is only ever reachable through a
 * short-lived presigned GET. R2 public access is bucket-wide, which is why
 * this needs a second bucket rather than a prefix.
 */
export type R2Bucket = 'public' | 'documents';

/** Types a browser renders natively, so the preview can be an <iframe>/<img>. */
const INLINE_PREVIEWABLE = (mimeType: string): boolean =>
  mimeType === 'application/pdf' || mimeType.startsWith('image/');

/**
 * RFC 6266 Content-Disposition. The file name is attacker-controlled (the
 * guest's original upload name), so the ASCII fallback is stripped of quotes,
 * backslashes and control characters and the real name is percent-encoded.
 */
export function contentDisposition(
  fileName: string,
  mimeType: string,
): string {
  if (INLINE_PREVIEWABLE(mimeType)) return 'inline';

  // eslint-disable-next-line no-control-regex
  const ascii = fileName.replace(/[^\x20-\x7e]|["\\]/g, '_') || 'document';
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

@Injectable()
export class R2StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly documentsBucket?: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID');
    this.bucket = this.configService.get<string>('R2_BUCKET_NAME')!;
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL')!;
    // ponytail: optional at boot so environments without the documents bucket
    // still start; resolveBucket() fails loudly the first time it is needed.
    this.documentsBucket = this.configService.get<string>(
      'R2_DOCUMENTS_BUCKET_NAME',
    );

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'R2_SECRET_ACCESS_KEY',
        )!,
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
    });
  }

  private resolveBucket(bucket: R2Bucket): string {
    if (bucket === 'public') return this.bucket;
    if (!this.documentsBucket) {
      throw new Error('R2_DOCUMENTS_BUCKET_NAME is not configured');
    }
    return this.documentsBucket;
  }

  async generatePresignedPutUrl(
    key: string,
    contentType: string,
    contentLength?: number,
    expiresInSeconds = 300,
    bucket: R2Bucket = 'public',
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.resolveBucket(bucket),
      Key: key,
      ContentType: contentType,
      // Signed Content-Length: R2 rejects any PUT whose body size differs, at the edge.
      ...(contentLength != null ? { ContentLength: contentLength } : {}),
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async deleteObjects(
    keys: string[],
    bucket: R2Bucket = 'public',
  ): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.resolveBucket(bucket),
          Delete: { Objects: keys.map((k) => ({ Key: k })) },
        }),
      );
    } catch (err) {
      // ponytail: orphan cleanup is best-effort; never fail the committed update. Add a retry queue if orphan buildup becomes real.
      console.error('R2 orphan cleanup failed', { keys, err });
    }
  }

  /**
   * Short-lived read URL for an object in the private documents bucket.
   * Documents-only on purpose: there is no bucket argument, so this can never
   * be pointed at the public bucket by omission.
   */
  async generatePresignedGetUrl(
    key: string,
    options: {
      fileName: string;
      mimeType: string;
      expiresInSeconds?: number;
    },
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.resolveBucket('documents'),
      Key: key,
      ResponseContentType: options.mimeType,
      ResponseContentDisposition: contentDisposition(
        options.fileName,
        options.mimeType,
      ),
    });

    return getSignedUrl(this.client, command, {
      expiresIn: options.expiresInSeconds ?? 300,
    });
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  /** Inverse of getPublicUrl; null if the URL isn't one of ours. */
  keyFromPublicUrl(url: string): string | null {
    const prefix = `${this.publicUrl}/`;
    return url.startsWith(prefix) ? url.slice(prefix.length) : null;
  }
}
