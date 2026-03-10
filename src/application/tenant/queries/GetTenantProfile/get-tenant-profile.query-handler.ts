import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetTenantProfileQuery } from './get-tenant-profile.query';
import {
  GetTenantProfileResult,
  TenantProfileDto,
} from './get-tenant-profile.result';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '@/domain/tenant/repositories/tenant.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@QueryHandler(GetTenantProfileQuery)
export class GetTenantProfileQueryHandler implements IQueryHandler<
  GetTenantProfileQuery,
  GetTenantProfileResult
> {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(query: GetTenantProfileQuery): Promise<GetTenantProfileResult> {
    const tenant = await this.tenantRepository.findById(
      TenantId.createFromString(query.tenantId),
    );

    if (!tenant) {
      throw new NotFoundException(`Tenant not found`);
    }

    return new GetTenantProfileResult(
      new TenantProfileDto(
        tenant.getId()!.toString(),
        tenant.getName(),
        tenant.getOwnerEmail().toString(),
        tenant.getPlan().toString(),
        tenant.getContactPhone(),
        tenant.getAddress(),
        tenant.getWebsite(),
        tenant.getLogoUrl(),
        tenant.isEmailVerified(),
        tenant.getCreatedAt(),
        tenant.getUpdatedAt(),
      ),
    );
  }
}
