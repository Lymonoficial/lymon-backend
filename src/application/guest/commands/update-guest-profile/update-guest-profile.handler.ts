import { ConflictException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { UpdateGuestProfileCommand } from './update-guest-profile.command';

@CommandHandler(UpdateGuestProfileCommand)
export class UpdateGuestProfileHandler
  implements ICommandHandler<UpdateGuestProfileCommand>
{
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(command: UpdateGuestProfileCommand): Promise<void> {
    const guestId = GuestId.createFromString(command.guestId);
    const guest = await this.guestRepository.findById(guestId);

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${command.guestId} not found`);
    }

    if (guest.getTenantId().toString() !== command.tenantId) {
      throw new ForbiddenException('You do not have permission to modify this guest');
    }

    if (command.fullName !== undefined) {
      guest.updateBasicInfo(
        command.fullName,
        command.firstName !== undefined ? command.firstName : guest.getFirstName(),
        command.lastName !== undefined ? command.lastName : guest.getLastName(),
      );
    }

    if (command.primaryEmail !== undefined) {
      const tenantId = TenantId.createFromString(command.tenantId);
      const existing = await this.guestRepository.findByPrimaryEmail(
        tenantId,
        command.primaryEmail,
      );
      if (existing && existing.getId()?.toString() !== command.guestId) {
        throw new ConflictException('A guest with this primary email already exists');
      }
      guest.setPrimaryEmail(command.primaryEmail);
    }

    if (command.emails !== undefined) {
      guest.setEmails(command.emails);
    }

    if (command.phones !== undefined) {
      guest.setPhones(command.phones);
    }

    if (command.identity !== undefined) {
      guest.setIdentity(command.identity);
    }

    await this.guestRepository.save(guest);
  }
}
