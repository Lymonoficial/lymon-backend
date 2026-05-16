import { Unit } from '@/domain/unit/entities/unit.entity';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';

export const UNIT_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b9c4',
  tenantId: '65f1a1a2b3c4d5e6f7a8b9c2',
  propertyId: '65f1a1a2b3c4d5e6f7a8b9c3',
  name: 'Test Unit',
  description: 'A test unit',
  inventoryCount: 5,
  maxGuests: 4,
  standardGuests: 2,
  bedrooms: [],
  bathroomsCount: 1,
  isShared: false,
  amenities: [],
  pricePerNight: 100000,
  externalIds: { bookingCom: null, airbnb: null },
  createdAt: new Date('2030-01-01T10:00:00Z'),
  updatedAt: new Date('2030-01-01T10:00:00Z'),
};

export function makeUnit(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    propertyId: string;
    inventoryCount: number;
    pricePerNight: number;
  }>,
): Unit {
  const merged = { ...UNIT_FIXTURE_DEFAULTS, ...overrides };
  return Unit.create({
    tenantId: TenantId.createFromString(merged.tenantId),
    propertyId: PropertyId.create(merged.propertyId),
    basicInfo: { name: merged.name, description: merged.description },
    inventoryConfig: { inventoryCount: merged.inventoryCount },
    capacityConfig: { maxGuests: merged.maxGuests, standardGuests: merged.standardGuests },
    physicalFeatures: {
      bedrooms: merged.bedrooms,
      bathroomsCount: merged.bathroomsCount,
      isShared: merged.isShared,
    },
    pricingConfig: { pricePerNight: merged.pricePerNight },
    amenities: merged.amenities,
    externalIds: merged.externalIds,
  });
}
