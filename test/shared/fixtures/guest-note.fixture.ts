import { GuestNote } from '@/domain/guest-note/entities/guest-note.entity';
import { GuestNoteId } from '@/domain/guest-note/value-objects/guest-note-id.vo';
import { GuestNoteTypeEnum } from '@/domain/guest-note/value-objects/guest-node-type.vo';
import { GuestNoteStatusEnum } from '@/domain/guest-note/value-objects/guest-node-status.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

export const GUEST_NOTE_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b9c6',
  tenantId: '65f1a1a2b3c4d5e6f7a8b9c0',
  guestId: '65f1a1a2b3c4d5e6f7a8b9d1',
  note: 'Guest always requests extra pillows',
  type: GuestNoteTypeEnum.PREFERENCE,
  status: GuestNoteStatusEnum.NOT_PINNED,
  createdBy: '65f1a1a2b3c4d5e6f7a8b9c2',
};

export function makeGuestNote(
  overrides?: Partial<typeof GUEST_NOTE_FIXTURE_DEFAULTS>,
): GuestNote {
  const merged = { ...GUEST_NOTE_FIXTURE_DEFAULTS, ...overrides };

  return GuestNote.reconstitute({
    id: GuestNoteId.createFromString(merged.id),
    tenantId: TenantId.createFromString(merged.tenantId),
    guestId: GuestId.createFromString(merged.guestId),
    note: merged.note,
    type: merged.type,
    status: merged.status,
    createdBy: merged.createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });
}
