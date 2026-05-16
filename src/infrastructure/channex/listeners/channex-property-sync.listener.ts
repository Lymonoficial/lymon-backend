import { CHANNEX_SERVICE } from '@/application/shared/services/channex.service';
import type { IChannexService } from '@/application/shared/services/channex.service';
import {
  CHANNEX_PROPERTY_SYNC_EVENT,
  ChannexPropertySyncEvent,
} from '@/infrastructure/channex/events/channex-property-sync.event';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { ChannexSyncStatus } from '@/domain/property/value-objects/channex-sync-status.vo';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChannexPropertySyncListener {
  private readonly logger = new Logger(ChannexPropertySyncListener.name);

  constructor(
    @Inject(CHANNEX_SERVICE)
    private readonly channexService: IChannexService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
  ) {}

  @OnEvent(CHANNEX_PROPERTY_SYNC_EVENT)
  async handlePropertySync(event: ChannexPropertySyncEvent): Promise<void> {
    const propertyId = PropertyId.create(event.propertyId);
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) return;

    try {
      const { channexId } = await this.channexService.createProperty({
        title: event.title,
        email: event.email,
        phone: event.phone,
        address: event.address,
        city: event.city,
        state: event.state,
        country: event.country,
        zipCode: event.zipCode,
        lat: event.lat,
        lng: event.lng,
      });

      property.setChannexSync(channexId, ChannexSyncStatus.create('SYNCED'));
      await this.propertyRepository.save(property);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `[CHANNEX] Failed to sync property ${event.propertyId}: ${message}. Will retry automatically.`,
      );
      property.setChannexSync(null, ChannexSyncStatus.create('FAILED'));
      await this.propertyRepository.save(property);
    }
  }
}
