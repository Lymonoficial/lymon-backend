import { Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPublicUnitsByTenantQuery } from './get-public-units-by-tenant.query';
import { GetPublicUnitsByTenantResult } from './get-public-units-by-tenant.result';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { TENANT_REPOSITORY } from '@/domain/tenant/repositories/tenant.repository';
import type { TenantRepository } from '@/domain/tenant/repositories/tenant.repository';
import { UNIT_REPOSITORY } from '@/domain/unit/repositories/unit.repository';
import type { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import { mapUnitToPublicDto } from '@/application/reservation/queries/shared/unit.mapper';

@QueryHandler(GetPublicUnitsByTenantQuery)
export class GetPublicUnitsByTenantQueryHandler implements IQueryHandler<
  GetPublicUnitsByTenantQuery,
  GetPublicUnitsByTenantResult
> {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
  ) {}

  async execute(
    query: GetPublicUnitsByTenantQuery,
  ): Promise<GetPublicUnitsByTenantResult> {
    const tenantId = TenantId.createFromString(String(query.tenantId));
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) throw new NotFoundException('Tenant not found');
    const { units, total } = await this.unitRepository.findByTenantIdPaginated(
      tenantId,
      query.page,
      query.limit,
    );
    const dtos = units.map(mapUnitToPublicDto);

    return new GetPublicUnitsByTenantResult(
      dtos,
      total,
      query.page,
      query.limit,
    );
  }
}
