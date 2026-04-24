import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateGuestNoteCommand } from './update-guest-note.command';
import {
  GUEST_NOTE_REPOSITORY,
  type GuestNoteRepository,
} from '@/domain/guest-note/repositories/guest-note.repository';
import { GuestNoteId } from '@/domain/guest-note/value-objects/guest-note-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@CommandHandler(UpdateGuestNoteCommand)
export class UpdateGuestNoteHandler
  implements ICommandHandler<UpdateGuestNoteCommand, void>
{
  constructor(
    @Inject(GUEST_NOTE_REPOSITORY)
    private readonly guestNoteRepository: GuestNoteRepository,
  ) {}

  async execute(command: UpdateGuestNoteCommand): Promise<void> {
    if (command.note === undefined && command.type === undefined) {
      throw new BadRequestException(
        'At least one field (note or type) must be provided',
      );
    }

    const tenantId = TenantId.createFromString(command.tenantId);
    const noteId = GuestNoteId.createFromString(command.noteId);

    const guestNote = await this.guestNoteRepository.findById(noteId, tenantId);
    if (!guestNote) {
      throw new NotFoundException('Guest note not found');
    }

    if (command.note !== undefined) {
      guestNote.updateContent(command.note);
    }

    if (command.type !== undefined) {
      guestNote.changeType(command.type);
    }

    await this.guestNoteRepository.save(guestNote);
  }
}
