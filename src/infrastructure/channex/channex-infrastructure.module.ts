import { CHANNEX_SERVICE } from '@/application/shared/services/channex.service';
import { ChannexHttpService } from '@/infrastructure/channex/services/channex-http.service';
import { ChannexPropertySyncListener } from '@/infrastructure/channex/listeners/channex-property-sync.listener';
import { ChannexPropertyUpdateListener } from '@/infrastructure/channex/listeners/channex-property-update.listener';
import { ChannexRoomTypeSyncListener } from '@/infrastructure/channex/listeners/channex-room-type-sync.listener';
import { ChannexAvailabilityUpdateListener } from '@/infrastructure/channex/listeners/channex-availability-update.listener';
import { ChannexRetrySyncScheduler } from '@/infrastructure/channex/schedulers/channex-retry-sync.scheduler';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule.register({ timeout: 10000 }), PersistenceModule],
  providers: [
    { provide: CHANNEX_SERVICE, useClass: ChannexHttpService },
    ChannexPropertySyncListener,
    ChannexPropertyUpdateListener,
    ChannexRoomTypeSyncListener,
    ChannexAvailabilityUpdateListener,
    ChannexRetrySyncScheduler,
  ],
  exports: [CHANNEX_SERVICE],
})
export class ChannexInfrastructureModule {}
