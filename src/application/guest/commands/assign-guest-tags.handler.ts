import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignGuestTagsCommand } from './assign-guest-tags.command';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import type { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';
import type { GuestTagRepository } from '@/domain/guest-tag/repositories/guest-tag.repository';
import { GUEST_TAG_REPOSITORY } from '@/domain/guest-tag/repositories/guest-tag.repository';

@CommandHandler(AssignGuestTagsCommand)
export class AssignGuestTagsHandler implements ICommandHandler<AssignGuestTagsCommand> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly repository: GuestRepository,
    @Inject(GUEST_TAG_REPOSITORY)
    private readonly tagRepository: GuestTagRepository,
  ) {}

  async execute(command: AssignGuestTagsCommand): Promise<void> {
    const { guestId, tags, tenantId } = command;

    const normalizedTags = [
      ...new Set(
        tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0),
      ),
    ];

    const foundTags = await this.tagRepository.findByNames(
      normalizedTags,
      tenantId,
    );

    if (foundTags.length !== normalizedTags.length) {
      const foundNames = new Set(foundTags.map((t) => t.getName()));
      const invalid = normalizedTags.filter((n) => !foundNames.has(n));
      throw new BadRequestException(`Unknown tag(s): ${invalid.join(', ')}`);
    }

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

    guest.setTags(foundTags);
    await this.repository.save(guest);
  }
}
