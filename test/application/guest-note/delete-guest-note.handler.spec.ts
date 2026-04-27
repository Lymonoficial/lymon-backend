import { NotFoundException } from '@nestjs/common';
import { DeleteGuestNoteHandler } from '@/application/guest-note/commands/delete-guest-note.handler';
import { DeleteGuestNoteCommand } from '@/application/guest-note/commands/delete-guest-note.command';
import { GuestNoteRepository } from '@/domain/guest-note/repositories/guest-note.repository';
import { createGuestNoteRepositoryMock } from '@test/shared/mocks/repositories/guest-note-repository.mock';
import {
  makeGuestNote,
  GUEST_NOTE_FIXTURE_DEFAULTS,
} from '@test/shared/fixtures/guest-note.fixture';

describe('DeleteGuestNoteHandler', () => {
  let handler: DeleteGuestNoteHandler;
  let guestNoteRepository: jest.Mocked<GuestNoteRepository>;

  beforeEach(() => {
    guestNoteRepository = createGuestNoteRepositoryMock();
    handler = new DeleteGuestNoteHandler(guestNoteRepository);
  });

  describe('when the note does not exist', () => {
    it('throws NotFoundException and does not call delete', async () => {
      guestNoteRepository.findById.mockResolvedValue(null);

      await expect(
        handler.execute(
          new DeleteGuestNoteCommand(
            GUEST_NOTE_FIXTURE_DEFAULTS.tenantId,
            GUEST_NOTE_FIXTURE_DEFAULTS.id,
            'user-456',
          ),
        ),
      ).rejects.toThrow(NotFoundException);

      expect(guestNoteRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('when the note exists', () => {
    it('calls repository.delete and resolves without a return value', async () => {
      guestNoteRepository.findById.mockResolvedValue(makeGuestNote());

      await expect(
        handler.execute(
          new DeleteGuestNoteCommand(
            GUEST_NOTE_FIXTURE_DEFAULTS.tenantId,
            GUEST_NOTE_FIXTURE_DEFAULTS.id,
            'user-456',
          ),
        ),
      ).resolves.toBeUndefined();

      expect(guestNoteRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
