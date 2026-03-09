import { Guest } from '@/domain/guest/entities/guest.entity';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';

export const GUEST_REPOSITORY = 'GUEST_REPOSITORY';

export interface GuestRepository {
  save(guest: Guest, transactionContext?: unknown): Promise<string>;
  findById(id: GuestId): Promise<Guest | null>;
  findByTenantId(tenantId: TenantId): Promise<Guest[]>;
  findByPrimaryEmail(
    tenantId: TenantId,
    primaryEmail: string,
  ): Promise<Guest | null>;
  findByGuestAccountId(
    tenantId: TenantId,
    guestAccountId: GuestAccountId,
  ): Promise<Guest | null>;
  countByTenantId(tenantId: TenantId): Promise<number>;
  delete(id: GuestId): Promise<void>;
}
