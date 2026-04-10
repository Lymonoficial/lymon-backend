import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignGuestTagsCommand } from './assign-guest-tags.command';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import type { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';

@CommandHandler(AssignGuestTagsCommand)
export class AssignGuestTagsHandler implements ICommandHandler<AssignGuestTagsCommand> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly repository: GuestRepository,
  ) {}

  async execute(command: AssignGuestTagsCommand): Promise<void> {
    const { guestId, tags, tenantId } = command;
    const guest = await this.repository.findById(
      GuestId.createFromString(guestId),
    );

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }
    if (guest.getTenantId().toString() !== tenantId) {
      throw new ForbiddenException(
        'You do not have permission to modify this guest',
      );
    }

    guest.setTags(tags);
    await this.repository.save(guest);
  }
}
