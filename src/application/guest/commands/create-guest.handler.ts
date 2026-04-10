import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Guest } from '@/domain/guest/entities/guest.entity';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CreateGuestCommand } from '@/application/guest/commands/create-guest.command';
import { CreateGuestResult } from '@/application/guest/commands/create-guest.result';

@CommandHandler(CreateGuestCommand)
export class CreateGuestHandler implements ICommandHandler<CreateGuestCommand> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(command: CreateGuestCommand): Promise<CreateGuestResult> {
    const tenantId = TenantId.createFromString(command.tenantId);
    const existingGuest = await this.guestRepository.findByPrimaryEmail(
      tenantId,
      command.primaryEmail,
    );

    if (existingGuest) {
      throw new ConflictException(
        'A guest with this primary email already exists',
      );
    }

    if (command.identity?.documentNumber) {
      const existingByDoc = await this.guestRepository.findByDocumentNumber(
        tenantId,
        command.identity.documentNumber,
      );
      if (existingByDoc) {
        throw new ConflictException(
          'A guest with this document number already exists',
        );
      }
    }

    const guest = Guest.create({
      tenantId,
      identity: command.identity ?? {},
      fullName: command.fullName,
      primaryEmail: command.primaryEmail,
      firstName: command.firstName,
      lastName: command.lastName,
      emails: command.emails,
      phones: command.phones,
      tags: command.tags,
      preferencesNotes: command.preferencesNotes,
    });

    const guestId = await this.guestRepository.save(guest);
    return new CreateGuestResult(guestId);
  }
}
