import { Inject, BadRequestException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  R2StorageService,
  R2_STORAGE_SERVICE,
} from '@/infrastructure/storage/r2-storage.service';
import {
  LOGO_EXT_BY_CONTENT_TYPE,
  tenantLogoPrefix,
} from '@/application/tenant/logo/tenant-logo-key';
import { GenerateTenantLogoUrlQuery } from './generate-tenant-logo-url.query';
import { GenerateTenantLogoUrlResult } from './generate-tenant-logo-url.result';

@QueryHandler(GenerateTenantLogoUrlQuery)
export class GenerateTenantLogoUrlQueryHandler
  implements
    IQueryHandler<GenerateTenantLogoUrlQuery, GenerateTenantLogoUrlResult>
{
  constructor(
    @Inject(R2_STORAGE_SERVICE)
    private readonly storageService: R2StorageService,
  ) {}

  async execute(
    query: GenerateTenantLogoUrlQuery,
  ): Promise<GenerateTenantLogoUrlResult> {
    const ext = LOGO_EXT_BY_CONTENT_TYPE[query.contentType];
    if (!ext) {
      throw new BadRequestException('Unsupported image type');
    }

    const key = `${tenantLogoPrefix(query.tenantId)}${Date.now()}.${ext}`;

    const presignedUrl = await this.storageService.generatePresignedPutUrl(
      key,
      query.contentType,
      query.fileSize,
    );
    const fileUrl = this.storageService.getPublicUrl(key);

    return new GenerateTenantLogoUrlResult(presignedUrl, fileUrl, key);
  }
}
