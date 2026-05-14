import { CHANNEX_SERVICE } from '@/application/shared/services/channex.service';
import { ChannexHttpService } from '@/infrastructure/channex/services/channex-http.service';
import { ChannexPropertySyncListener } from '@/infrastructure/channex/listeners/channex-property-sync.listener';
import { ChannexRetrySyncScheduler } from '@/infrastructure/channex/schedulers/channex-retry-sync.scheduler';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [HttpModule.register({ timeout: 10000 }), PersistenceModule],
  providers: [
    { provide: CHANNEX_SERVICE, useClass: ChannexHttpService },
    ChannexPropertySyncListener,
    ChannexRetrySyncScheduler,
  ],
})
export class ChannexInfrastructureModule {}
