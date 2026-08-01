import { GuestDocument } from '@/domain/guest-document/entities/guest-document.entity';
import { GuestDocumentId } from '@/domain/guest-document/value-objects/guest-document-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export const GUEST_DOCUMENT_REPOSITORY = 'GUEST_DOCUMENT_REPOSITORY';

export interface GuestDocumentRepository {
  save(guestDocument: GuestDocument): Promise<void>;
  findById(
    id: GuestDocumentId,
    tenantId: TenantId,
  ): Promise<GuestDocument | null>;
  findByGuestId(
    guestId: GuestId,
    tenantId: TenantId,
  ): Promise<GuestDocument[]>;
  delete(id: GuestDocumentId, tenantId: TenantId): Promise<void>;
}
