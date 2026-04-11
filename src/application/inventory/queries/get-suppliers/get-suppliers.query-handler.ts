import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSuppliersQuery } from './get-suppliers.query';
import {
  GetSuppliersResult,
  type SupplierListItemDto,
} from './get-suppliers.result';
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '@/domain/inventory/repositories/supplier.repository';
import { type Supplier } from '@/domain/inventory/entities/supplier.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import {
  type SupplierSortBy,
  type SupplierSortOrder,
} from './get-suppliers.query';

@QueryHandler(GetSuppliersQuery)
export class GetSuppliersQueryHandler implements IQueryHandler<
  GetSuppliersQuery,
  GetSuppliersResult
> {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(query: GetSuppliersQuery): Promise<GetSuppliersResult> {
    const tenantId = TenantId.createFromString(query.tenantId);
    const page = query.page > 0 ? query.page : 1;
    const limit = query.limit > 0 ? query.limit : 20;
    const normalizedSearch = query.search?.trim().toLowerCase() ?? '';

    const suppliers: Supplier[] =
      await this.supplierRepository.findByTenantId(tenantId);

    const filtered: Supplier[] = normalizedSearch
      ? suppliers.filter((supplier) =>
          supplier.getName().toLowerCase().includes(normalizedSearch),
        )
      : suppliers;

    const sorted: Supplier[] = [...filtered].sort((a, b) =>
      this.compareSuppliers(a, b, query.sortBy, query.sortOrder),
    );

    const total = sorted.length;
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    return new GetSuppliersResult(
      paginated.map((supplier) => this.toSupplierListItemDto(supplier)),
      total,
      page,
      limit,
    );
  }

  private compareSuppliers(
    first: Supplier,
    second: Supplier,
    sortBy: SupplierSortBy,
    sortOrder: SupplierSortOrder,
  ): number {
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'name') {
      const firstName = first.getName().toLowerCase();
      const secondName = second.getName().toLowerCase();
      return firstName.localeCompare(secondName) * direction;
    }

    const firstCreatedAt = first.getCreatedAt().getTime();
    const secondCreatedAt = second.getCreatedAt().getTime();
    return (firstCreatedAt - secondCreatedAt) * direction;
  }

  private toSupplierListItemDto(supplier: Supplier): SupplierListItemDto {
    return {
      supplierId: supplier.getId()?.toString() ?? '',
      name: supplier.getName(),
      contactEmail: supplier.getContactEmail(),
      contactPhone: supplier.getContactPhone(),
      status: supplier.getDeletedAt() ? 'INACTIVE' : 'ACTIVE',
      createdAt: supplier.getCreatedAt().toISOString(),
    };
  }
}
