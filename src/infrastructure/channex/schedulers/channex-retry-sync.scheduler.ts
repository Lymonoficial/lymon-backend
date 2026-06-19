import { CHANNEX_SERVICE } from '@/application/shared/services/channex.service';
import type { IChannexService } from '@/application/shared/services/channex.service';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import { ChannexSyncStatus } from '@/domain/property/value-objects/channex-sync-status.vo';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ChannexRetrySyncScheduler {
  private readonly logger = new Logger(ChannexRetrySyncScheduler.name);

  constructor(
    @Inject(CHANNEX_SERVICE)
    private readonly channexService: IChannexService,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
  ) {}

  @Cron('0 */15 * * * *')
  async retryFailedSyncs(): Promise<void> {
    const failedProperties =
      await this.propertyRepository.findFailedChannexSync();
    if (failedProperties.length === 0) return;

    this.logger.log(
      `[CHANNEX] Retrying sync for ${failedProperties.length} failed properties`,
    );

    let succeeded = 0;
    let failed = 0;

    for (const property of failedProperties) {
      try {
        const location = property.getLocation().toObject();
        const { channexId } = await this.channexService.createProperty({
          title: property.getName(),
          email: property.getHostEmail(),
          phone: property.getHostPhone(),
          address: property.getAddress(),
          city: property.getCity(),
          state: property.getState(),
          country: property.getCountry(),
          zipCode: property.getZipCode(),
          lat: location.lat,
          lng: location.lng,
        });

        property.setChannexSync(channexId, ChannexSyncStatus.create('SYNCED'));
        await this.propertyRepository.save(property);
        succeeded++;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `[CHANNEX] Retry failed for property ${property.getId()?.toString()}: ${message}`,
        );
        failed++;
      }
    }

    this.logger.log(
      `[CHANNEX] Retry complete: ${succeeded} synced, ${failed} still failing`,
    );
  }
}
