import { Property } from '@/domain/property/entities/property.entity';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import {
  PropertyType,
  PropertyTypeEnum,
} from '@/domain/property/value-objects/property-type.vo';
import {
  CancellationPolicy,
  CancellationPolicyEnum,
} from '@/domain/property/value-objects/cancellation-policy.vo';
import { Location } from '@/domain/property/value-objects/location.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { TENANT_FIXTURE_DEFAULTS } from '@test/shared/fixtures/tenant.fixture';

export const PROPERTY_FIXTURE_DEFAULTS = {
  id: 'property-123',
  tenantId: TENANT_FIXTURE_DEFAULTS.id,
  name: 'Casa del lago',
  description: 'Una hermosa casa',
  propertyType: PropertyTypeEnum.CASA,
  address: 'Calle 123',
  city: 'Bogotá',
  state: 'Cundinamarca',
  country: 'Colombia',
  zipCode: '110111',
  location: { lat: 4.6097, lng: -74.0817 },
  checkInTime: '15:00',
  checkOutTime: '11:00',
  cancellationPolicy: CancellationPolicyEnum.FLEXIBLE,
  hostPhone: '+573001234567',
  hostEmail: 'host@example.com',
};

export function makeProperty(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    propertyType: PropertyTypeEnum;
    cancellationPolicy: CancellationPolicyEnum;
  }>,
): Property {
  const merged = { ...PROPERTY_FIXTURE_DEFAULTS, ...overrides };
  return Property.reconstitute(
    PropertyId.create(merged.id),
    TenantId.createFromString(merged.tenantId),
    merged.name,
    merged.description,
    PropertyType.create(merged.propertyType),
    merged.address,
    merged.city,
    merged.state,
    merged.country,
    merged.zipCode,
    Location.create(merged.location.lat, merged.location.lng),
    merged.checkInTime,
    merged.checkOutTime,
    CancellationPolicy.create(merged.cancellationPolicy),
    merged.hostPhone,
    merged.hostEmail,
    new Date(),
    new Date(),
    null,
  );
}
