import { Unit } from '@/domain/unit/entities/unit.entity';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { ExternalIds } from '@/domain/unit/value-objects/external-ids.vo';
import { TENANT_FIXTURE_DEFAULTS } from '@test/shared/fixtures/tenant.fixture';
import { PROPERTY_FIXTURE_DEFAULTS } from '@test/shared/fixtures/property.fixture';

export const UNIT_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b9c8',
  tenantId: TENANT_FIXTURE_DEFAULTS.id,
  propertyId: PROPERTY_FIXTURE_DEFAULTS.id,
  name: 'Unit Name',
  description: 'Unit Description',
  inventoryCount: 1,
  maxGuests: 4,
  standardGuests: 2,
  bedrooms: [],
  bathroomsCount: 1,
  isShared: false,
  pricePerNight: 100,
  amenities: ['wifi'],
  externalIds: {
    airbnbId: 'ext-airbnb',
    bookingId: 'ext-booking',
    vrboId: 'ext-vrbo',
  },
};

export function makeUnit(
  overrides?: Partial<{ id: string; tenantId: string }>,
): Unit {
  const merged = { ...UNIT_FIXTURE_DEFAULTS, ...overrides };
  return Unit.reconstitute({
    id: UnitId.create(merged.id),
    tenantId: TenantId.createFromString(merged.tenantId),
    propertyId: PropertyId.create(merged.propertyId),
    basicInfo: {
      name: merged.name,
      description: merged.description,
    },
    inventoryConfig: {
      inventoryCount: merged.inventoryCount,
    },
    capacityConfig: {
      maxGuests: merged.maxGuests,
      standardGuests: merged.standardGuests,
    },
    physicalFeatures: {
      bedrooms: merged.bedrooms,
      bathroomsCount: merged.bathroomsCount,
      isShared: merged.isShared,
    },
    pricingConfig: {
      pricePerNight: merged.pricePerNight,
    },
    amenities: merged.amenities,
    externalIds: ExternalIds.create(
      merged.externalIds.airbnbId,
      merged.externalIds.bookingId,
      merged.externalIds.vrboId,
    ),
    timestamps: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
