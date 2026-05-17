import { ExperiencePurchase } from '@/domain/experience-purchase/entities/experience-purchase.entity';
import { ExperiencePurchaseId } from '@/domain/experience-purchase/value-objects/experience-purchase-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

export const EXPERIENCE_PURCHASE_REPOSITORY = 'EXPERIENCE_PURCHASE_REPOSITORY';

export interface ExperiencePurchaseRepository {
  save(
    purchase: ExperiencePurchase,
    ctx?: TransactionContextData,
  ): Promise<string>;
  findById(id: ExperiencePurchaseId): Promise<ExperiencePurchase | null>;
  findByGuestAccountId(
    guestAccountId: GuestAccountId,
    tenantId: TenantId,
    page: number,
    limit: number,
  ): Promise<ExperiencePurchase[]>;
  countByGuestAccountId(
    guestAccountId: GuestAccountId,
    tenantId: TenantId,
  ): Promise<number>;
  countConfirmedByExperienceAndDate(
    experienceId: string,
    selectedDate: Date | null,
  ): Promise<number>;
}
