import { GuestEmail } from '../entities/guest-email.entity';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export interface GuestEmailRepository {
  save(guestEmail: GuestEmail): Promise<void>;
  findByGuestId(tenantId: TenantId, guestId: GuestId): Promise<GuestEmail[]>;
}

export const GUEST_EMAIL_REPOSITORY = Symbol('GuestEmailRepository');
