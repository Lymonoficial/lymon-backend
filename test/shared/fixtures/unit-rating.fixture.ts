import { UnitRating } from '@/domain/unit-rating/entities/unit-rating.entity';
import { UnitRatingId } from '@/domain/unit-rating/value-objects/unit-rating-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';

export const UNIT_RATING_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b9d0',
  tenantId: '65f1a1a2b3c4d5e6f7a8b9c0',
  unitId: '65f1a1a2b3c4d5e6f7a8b9c1',
  guestId: '65f1a1a2b3c4d5e6f7a8b9c2',
  reservationId: '65f1a1a2b3c4d5e6f7a8b9c3',
  rate: 4,
  message: 'Great unit!',
};

export function makeUnitRating(
  overrides?: Partial<typeof UNIT_RATING_FIXTURE_DEFAULTS>,
): UnitRating {
  const merged = { ...UNIT_RATING_FIXTURE_DEFAULTS, ...overrides };
  return UnitRating.reconstitute({
    id: UnitRatingId.create(merged.id),
    tenantId: TenantId.createFromString(merged.tenantId),
    unitId: UnitId.create(merged.unitId),
    guestId: GuestId.createFromString(merged.guestId),
    reservationId: ReservationId.create(merged.reservationId),
    rate: merged.rate,
    message: merged.message,
    createdAt: new Date('2030-01-01T10:00:00Z'),
    updatedAt: new Date('2030-01-01T10:00:00Z'),
    deletedAt: null,
  });
}
