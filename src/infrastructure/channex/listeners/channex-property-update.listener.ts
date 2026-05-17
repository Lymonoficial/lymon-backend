import { CHANNEX_SERVICE } from '@/application/shared/services/channex.service';
import type { IChannexService } from '@/application/shared/services/channex.service';
import {
  CHANNEX_PROPERTY_UPDATE_EVENT,
  ChannexPropertyUpdateEvent,
} from '@/infrastructure/channex/events/channex-property-update.event';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChannexPropertyUpdateListener {
  private readonly logger = new Logger(ChannexPropertyUpdateListener.name);

  constructor(
    @Inject(CHANNEX_SERVICE)
    private readonly channexService: IChannexService,
  ) {}

  @OnEvent(CHANNEX_PROPERTY_UPDATE_EVENT)
  async handlePropertyUpdate(event: ChannexPropertyUpdateEvent): Promise<void> {
    try {
      await this.channexService.updateProperty(event.channexId, {
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

      this.logger.log(
        `[CHANNEX] Property ${event.channexId} updated successfully`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `[CHANNEX] Failed to update property ${event.channexId}: ${message}`,
      );
    }
  }
}
