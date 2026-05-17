import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { GetExperiencePurchasesByGuestHandler } from '@/application/experience-purchase/queries/get-experience-purchases-by-guest/get-experience-purchases-by-guest.handler';
import { GetExperiencePurchaseByIdHandler } from '@/application/experience-purchase/queries/get-experience-purchase-by-id/get-experience-purchase-by-id.handler';

const QueryHandlers = [
  GetExperiencePurchasesByGuestHandler,
  GetExperiencePurchaseByIdHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class ExperiencePurchaseApplicationModule {}
