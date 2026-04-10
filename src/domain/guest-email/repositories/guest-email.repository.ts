import { GuestEmail } from '../entities/guest-email.entity';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestEmailId } from '../value-objects/guest-email-id.vo';

export interface GuestEmailRepository {
  save(guestEmail: GuestEmail): Promise<void>;
  findById(id: GuestEmailId): Promise<GuestEmail | null>;
  findByGuestId(tenantId: TenantId, guestId: GuestId): Promise<GuestEmail[]>;
}

export const GUEST_EMAIL_REPOSITORY = Symbol('GuestEmailRepository');
