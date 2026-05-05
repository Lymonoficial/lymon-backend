import { GuestTag } from '@/domain/guest-tag/entities/guest-tag.entity';
import { GuestTagId } from '@/domain/guest-tag/value-objects/guest-tag-id.vo';

export const GUEST_TAG_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7000001',
  tenantId: '__platform__',
};

export function makeGuestTag(
  overrides?: Partial<{ id: string; tenantId: string; name: string }>,
): GuestTag {
  const merged = {
    id: GUEST_TAG_FIXTURE_DEFAULTS.id,
    tenantId: GUEST_TAG_FIXTURE_DEFAULTS.tenantId,
    name: 'vip',
    ...overrides,
  };

  return GuestTag.reconstitute(
    GuestTagId.createFromString(merged.id),
    merged.tenantId,
    merged.name,
    new Date('2024-01-01'),
  );
}
