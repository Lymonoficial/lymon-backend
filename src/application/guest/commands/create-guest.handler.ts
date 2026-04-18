import { BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Guest } from '@/domain/guest/entities/guest.entity';
import {
  GUEST_REPOSITORY,
  type GuestRepository,
} from '@/domain/guest/repositories/guest.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CreateGuestCommand } from '@/application/guest/commands/create-guest.command';
import { CreateGuestResult } from '@/application/guest/commands/create-guest.result';
import {
  GUEST_PREFERENCE_CATALOG_REPOSITORY,
  type GuestPreferenceCatalogRepository,
} from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import type { GuestPreferenceItem } from '@/domain/guest/value-objects/guest-preference-item.vo';

@CommandHandler(CreateGuestCommand)
export class CreateGuestHandler implements ICommandHandler<CreateGuestCommand> {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
    @Inject(GUEST_PREFERENCE_CATALOG_REPOSITORY)
    private readonly catalogRepository: GuestPreferenceCatalogRepository,
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

    const preferences = await this.buildPreferenceItems(
      command.tenantId,
      command.preferences ?? [],
    );

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
      preferences,
    });

    const guestId = await this.guestRepository.save(guest);
    return new CreateGuestResult(guestId);
  }

  private async buildPreferenceItems(
    tenantId: string,
    catalogItemIds: string[],
  ): Promise<GuestPreferenceItem[]> {
    if (catalogItemIds.length === 0) return [];

    const catalogItems = await this.catalogRepository.findByTenant(
      TenantId.createFromString(tenantId),
    );

    const catalogMap = new Map(
      catalogItems.map((item) => [item.getId()!, item]),
    );

    const result: GuestPreferenceItem[] = [];

    for (const id of catalogItemIds) {
      const catalogItem = catalogMap.get(id);

      if (!catalogItem) {
        throw new BadRequestException(
          `Preference catalog item '${id}' does not exist or does not belong to this tenant`,
        );
      }

      if (!catalogItem.getIsActive()) {
        throw new BadRequestException(
          `Preference catalog item '${id}' is not active`,
        );
      }

      result.push({
        catalogItemId: id,
        labelSnapshot: catalogItem.getLabel() ?? catalogItem.getKey() ?? '',
        category: catalogItem.getCategory(),
      });
    }

    return result;
  }
}
