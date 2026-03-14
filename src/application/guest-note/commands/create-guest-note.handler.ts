import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GuestNote } from '@/domain/guest-note/entities/guest-note.entity';
import {
  GUEST_NOTE_REPOSITORY,
  type GuestNoteRepository,
} from '@/domain/guest-note/repositories/guest-note.repository';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CreateGuestNoteCommand } from '@/application/guest-note/commands/create-guest-note.command';
import { CreateGuestNoteResult } from '@/application/guest-note/commands/create-guest-note.result';

@CommandHandler(CreateGuestNoteCommand)
export class CreateGuestNoteHandler implements ICommandHandler<CreateGuestNoteCommand> {
  constructor(
    @Inject(GUEST_NOTE_REPOSITORY)
    private readonly guestNoteRepository: GuestNoteRepository,
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(command: CreateGuestNoteCommand): Promise<CreateGuestNoteResult> {
    const tenantId = TenantId.createFromString(command.tenantId);
    const guestId = GuestId.createFromString(command.guestId);

    // Verificamos que el Guest realmente exista y pertenezca al Tenant
    const guest = await this.guestRepository.findById(guestId);
    if (!guest || !guest.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Guest not found');
    }

    const guestNote = GuestNote.create({
      tenantId,
      guestId,
      note: command.note,
      type: command.type,
      status: command.status,
      createdBy: command.createdBy,
    });

    await this.guestNoteRepository.save(guestNote);

    return new CreateGuestNoteResult(guestNote.getId()?.toString() || '');
  }
}
