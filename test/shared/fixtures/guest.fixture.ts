import { Guest } from '@/domain/guest/entities/guest.entity';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestStatusEnum } from '@/domain/guest/entities/guest.types';

export const GUEST_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b9c0',
  tenantId: 'tenant-123',
  fullName: 'John Doe',
  primaryEmail: 'john.doe@example.com',
  status: GuestStatusEnum.ACTIVE,
  identity: {
    documentType: 'passport',
    documentNumber: 'AB123456',
    countryCode: 'US',
  },
};

export function makeGuest(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    fullName: string;
    primaryEmail: string;
    status: GuestStatusEnum;
    identity: any;
  }>,
): Guest {
  const merged = { ...GUEST_FIXTURE_DEFAULTS, ...overrides };

  const guest = Guest.create({
    tenantId: TenantId.createFromString(merged.tenantId),
    identity: merged.identity,
    fullName: merged.fullName,
    primaryEmail: merged.primaryEmail,
    status: merged.status,
  });

  // Force the ID since Guest.create() sets it to null for New guests
  const guestId = GuestId.createFromString(merged.id);
  jest.spyOn(guest, 'getId').mockReturnValue(guestId);

  return guest;
}
