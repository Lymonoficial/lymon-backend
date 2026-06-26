import { Experience } from '@/domain/experience/entities/experience.entity';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import {
  ExperienceScope,
  ExperienceScopeEnum,
} from '@/domain/experience/value-objects/experience-scope.vo';
import {
  ExperienceCategory,
  ExperienceCategoryEnum,
} from '@/domain/experience/value-objects/experience-category.vo';
import {
  ExperienceAvailabilityType,
  ExperienceAvailabilityTypeEnum,
} from '@/domain/experience/value-objects/experience-availability-type.vo';
import {
  ExperienceStatus,
  ExperienceStatusEnum,
} from '@/domain/experience/value-objects/experience-status.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { TENANT_FIXTURE_DEFAULTS } from '@test/shared/fixtures/tenant.fixture';
import { PROPERTY_FIXTURE_DEFAULTS } from '@test/shared/fixtures/property.fixture';

export const EXPERIENCE_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b9e1',
  tenantId: TENANT_FIXTURE_DEFAULTS.id,
  propertyId: PROPERTY_FIXTURE_DEFAULTS.id,
  name: 'Airport transfer',
  description: 'Private transfer from the airport to the property',
  priceCop: 120000,
  durationHours: 2,
  capacity: 8,
  location: { label: 'Main lobby', lat: 4.6097, lng: -74.0817 },
};

export function makeExperience(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    propertyId: string;
  }>,
): Experience {
  const merged = { ...EXPERIENCE_FIXTURE_DEFAULTS, ...overrides };
  return Experience.reconstitute({
    id: ExperienceId.create(merged.id),
    tenantId: TenantId.createFromString(merged.tenantId),
    scope: ExperienceScope.create(ExperienceScopeEnum.PROPERTY),
    propertyId: PropertyId.create(merged.propertyId),
    unitIds: [],
    name: merged.name,
    description: merged.description,
    category: ExperienceCategory.create(ExperienceCategoryEnum.TRANSPORTATION),
    priceCop: merged.priceCop,
    durationHours: merged.durationHours,
    capacity: merged.capacity,
    location: merged.location,
    availabilityType: ExperienceAvailabilityType.create(
      ExperienceAvailabilityTypeEnum.DATE_RANGE,
    ),
    startAt: new Date('2099-01-10T10:00:00.000Z'),
    endAt: new Date('2099-01-20T10:00:00.000Z'),
    blackoutRanges: [],
    allowStandalonePurchase: true,
    allowReservationPurchase: true,
    minNoticeHours: 2,
    purchaseCutoffHours: 24,
    status: ExperienceStatus.create(ExperienceStatusEnum.ACTIVE),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });
}
