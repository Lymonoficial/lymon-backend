import {
  CHANNEX_SERVICE,
} from '@/application/shared/services/channex.service';
import type { IChannexService } from '@/application/shared/services/channex.service';
import {
  CHANNEX_ROOM_TYPE_SYNC_EVENT,
  ChannexRoomTypeSyncEvent,
} from '@/infrastructure/channex/events/channex-room-type-sync.event';
import {
  UNIT_REPOSITORY,
} from '@/domain/unit/repositories/unit.repository';
import type { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import type { ChannexAvailabilityEntry } from '@/application/shared/services/channex.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChannexRoomTypeSyncListener {
  private readonly logger = new Logger(ChannexRoomTypeSyncListener.name);

  constructor(
    @Inject(CHANNEX_SERVICE)
    private readonly channexService: IChannexService,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
  ) {}

  private async pushInitialAvailability(
    propertyChannexId: string,
    roomTypeId: string,
    inventoryCount: number,
  ): Promise<void> {
    const entries: ChannexAvailabilityEntry[] = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() + i);
      entries.push({ date: d.toISOString().slice(0, 10), availability: inventoryCount });
    }
    try {
      await this.channexService.updateAvailability(propertyChannexId, roomTypeId, entries);
      this.logger.log(`[CHANNEX] Initial availability set for room type ${roomTypeId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`[CHANNEX] Failed to set initial availability for room type ${roomTypeId}: ${message}`);
    }
  }

  @OnEvent(CHANNEX_ROOM_TYPE_SYNC_EVENT)
  async handleRoomTypeSync(event: ChannexRoomTypeSyncEvent): Promise<void> {
    const unit = await this.unitRepository.findById(UnitId.create(event.unitId));
    if (!unit) return;

    try {
      const { roomTypeId } = await this.channexService.createRoomType(
        event.propertyChannexId,
        {
          title: event.title,
          countOfRooms: event.countOfRooms,
          occAdults: event.occAdults,
        },
      );

      unit.setChannexRoomTypeId(roomTypeId);
      await this.unitRepository.save(unit);

      this.logger.log(
        `[CHANNEX] Unit ${event.unitId} synced as room type ${roomTypeId}`,
      );

      await this.pushInitialAvailability(
        event.propertyChannexId,
        roomTypeId,
        event.countOfRooms,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `[CHANNEX] Failed to sync unit ${event.unitId} as room type: ${message}`,
      );
    }
  }
}
