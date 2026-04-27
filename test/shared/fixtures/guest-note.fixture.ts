import { GuestNote } from '@/domain/guest-note/entities/guest-note.entity';
import { GuestNoteId } from '@/domain/guest-note/value-objects/guest-note-id.vo';
import { GuestNoteTypeEnum } from '@/domain/guest-note/value-objects/guest-node-type.vo';
import { GuestNoteStatusEnum } from '@/domain/guest-note/value-objects/guest-node-status.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

export const GUEST_NOTE_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b9c1',
  tenantId: 'tenant-123',
  guestId: '65f1a1a2b3c4d5e6f7a8b9d1',
  note: 'Guest always requests extra pillows',
  type: GuestNoteTypeEnum.PREFERENCE,
  status: GuestNoteStatusEnum.NOT_PINNED,
  createdBy: 'user-456',
};

export function makeGuestNote(
  overrides?: Partial<typeof GUEST_NOTE_FIXTURE_DEFAULTS>,
): GuestNote {
  const merged = { ...GUEST_NOTE_FIXTURE_DEFAULTS, ...overrides };

  return GuestNote.reconstitute(
    GuestNoteId.createFromString(merged.id),
    TenantId.createFromString(merged.tenantId),
    GuestId.createFromString(merged.guestId),
    merged.note,
    merged.type,
    merged.status,
    merged.createdBy,
    new Date(),
    new Date(),
    null,
  );
}
