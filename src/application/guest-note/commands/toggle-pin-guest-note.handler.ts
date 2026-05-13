import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TogglePinGuestNoteCommand } from './toggle-pin-guest-note.command';
import {
  GUEST_NOTE_REPOSITORY,
  type GuestNoteRepository,
} from '@/domain/guest-note/repositories/guest-note.repository';
import { GuestNoteId } from '@/domain/guest-note/value-objects/guest-note-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@CommandHandler(TogglePinGuestNoteCommand)
export class TogglePinGuestNoteHandler implements ICommandHandler<
  TogglePinGuestNoteCommand,
  void
> {
  constructor(
    @Inject(GUEST_NOTE_REPOSITORY)
    private readonly guestNoteRepository: GuestNoteRepository,
  ) {}

  async execute(command: TogglePinGuestNoteCommand): Promise<void> {
    const tenantId = TenantId.createFromString(command.tenantId);
    const noteId = GuestNoteId.createFromString(command.noteId);

    const guestNote = await this.guestNoteRepository.findById(noteId, tenantId);
    if (!guestNote) {
      throw new NotFoundException('Guest note not found');
    }

    guestNote.togglePin();
    await this.guestNoteRepository.save(guestNote);
  }
}
