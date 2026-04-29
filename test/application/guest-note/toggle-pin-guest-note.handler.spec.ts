import { NotFoundException } from '@nestjs/common';
import { TogglePinGuestNoteHandler } from '@/application/guest-note/commands/toggle-pin-guest-note.handler';
import { TogglePinGuestNoteCommand } from '@/application/guest-note/commands/toggle-pin-guest-note.command';
import { GuestNoteRepository } from '@/domain/guest-note/repositories/guest-note.repository';
import { GuestNoteStatusEnum } from '@/domain/guest-note/value-objects/guest-node-status.vo';
import { createGuestNoteRepositoryMock } from '@test/shared/mocks/repositories/guest-note-repository.mock';
import {
  makeGuestNote,
  GUEST_NOTE_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/guest-note.fixture';

describe('TogglePinGuestNoteHandler', () => {
  let handler: TogglePinGuestNoteHandler;
  let guestNoteRepository: jest.Mocked<GuestNoteRepository>;

  beforeEach(() => {
    guestNoteRepository = createGuestNoteRepositoryMock();
    handler = new TogglePinGuestNoteHandler(guestNoteRepository);
  });

  describe('when the note does not exist', () => {
    it('throws NotFoundException and does not call save', async () => {
      guestNoteRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(
          new TogglePinGuestNoteCommand(
            GUEST_NOTE_FIXTURE_DEFAULTS.tenantId,
            GUEST_NOTE_FIXTURE_DEFAULTS.id,
            'user-456',
          ),
        ),
      ).rejects.toThrow(NotFoundException);

      expect(guestNoteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('when the note is NOT_PINNED', () => {
    it('pins the note and saves', async () => {
      const guestNote = makeGuestNote({ status: GuestNoteStatusEnum.NOT_PINNED });
      guestNoteRepository.findById.mockResolvedValue(guestNote);

      await handler.execute(
        new TogglePinGuestNoteCommand(
          GUEST_NOTE_FIXTURE_DEFAULTS.tenantId,
          GUEST_NOTE_FIXTURE_DEFAULTS.id,
          'user-456',
        ),
      );

      expect(guestNoteRepository.save).toHaveBeenCalledTimes(1);
      const saved = guestNoteRepository.save.mock.calls[0][0];
      expect(saved.getStatus()).toBe(GuestNoteStatusEnum.IS_PINNED);
    });
  });

  describe('when the note is IS_PINNED', () => {
    it('unpins the note and saves', async () => {
      const guestNote = makeGuestNote({ status: GuestNoteStatusEnum.IS_PINNED });
      guestNoteRepository.findById.mockResolvedValue(guestNote);

      await handler.execute(
        new TogglePinGuestNoteCommand(
          GUEST_NOTE_FIXTURE_DEFAULTS.tenantId,
          GUEST_NOTE_FIXTURE_DEFAULTS.id,
          'user-456',
        ),
      );

      expect(guestNoteRepository.save).toHaveBeenCalledTimes(1);
      const saved = guestNoteRepository.save.mock.calls[0][0];
      expect(saved.getStatus()).toBe(GuestNoteStatusEnum.NOT_PINNED);
    });
  });
});
