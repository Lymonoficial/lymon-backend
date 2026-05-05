import { Experience } from '@/domain/experience/entities/experience.entity';
import { ExperienceAvailabilityType } from '@/domain/experience/value-objects/experience-availability-type.vo';
import {
  ExperienceCategory,
  ExperienceCategoryEnum,
} from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import {
  ExperienceScope,
  ExperienceScopeEnum,
} from '@/domain/experience/value-objects/experience-scope.vo';
import { ExperienceStatus } from '@/domain/experience/value-objects/experience-status.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export const EXPERIENCE_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b901',
  tenantId: '65f1a1a2b3c4d5e6f7a8b9c0',
  scope: ExperienceScopeEnum.TENANT,
  name: 'Airport Transfer',
  description: 'Comfortable airport transfer service.',
  category: ExperienceCategoryEnum.TRANSPORTATION,
  priceCop: 50000,
  durationHours: 1,
  capacity: 4,
  coverImageUrl: 'https://example.com/cover.jpg',
  status: 'ACTIVE',
};

export function makeExperience(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    scope: ExperienceScopeEnum;
    name: string;
    description: string;
    category: ExperienceCategoryEnum;
    priceCop: number;
    durationHours: number;
    capacity: number;
    coverImageUrl: string;
    status: string;
  }>,
): Experience {
  const merged = { ...EXPERIENCE_FIXTURE_DEFAULTS, ...overrides };

  return Experience.reconstitute({
    id: ExperienceId.create(merged.id),
    tenantId: TenantId.createFromString(merged.tenantId),
    scope: ExperienceScope.create(merged.scope),
    unitIds: [],
    name: merged.name,
    description: merged.description,
    category: ExperienceCategory.create(merged.category),
    priceCop: merged.priceCop,
    durationHours: merged.durationHours,
    capacity: merged.capacity,
    coverImageUrl: merged.coverImageUrl,
    location: { label: 'El Dorado Airport', lat: 4.702, lng: -74.147 },
    availabilityType: ExperienceAvailabilityType.create('RECURRING'),
    recurrence: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '08:00',
      endTime: '18:00',
    },
    blackoutRanges: [],
    allowStandalonePurchase: true,
    allowReservationPurchase: true,
    minNoticeHours: 2,
    purchaseCutoffHours: 24,
    status: ExperienceStatus.create(merged.status),
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
  });
}
