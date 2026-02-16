import { Unit } from '@/domain/unit/entities/unit.entity';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export const UNIT_REPOSITORY = 'UNIT_REPOSITORY';

export interface UnitRepository {
  save(unit: Unit, transactionContext?: unknown): Promise<string>;
  findById(id: UnitId): Promise<Unit | null>;
  findByPropertyId(propertyId: PropertyId): Promise<Unit[]>;
  findByTenantId(tenantId: TenantId): Promise<Unit[]>;
  countByTenantId(tenantId: TenantId): Promise<number>;
  delete(id: UnitId): Promise<void>;
}
