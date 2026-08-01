import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestDocumentTypeEnum } from '@/domain/guest-document/value-objects/guest-document-type.vo';

export interface CreateGuestDocumentParams {
  tenantId: TenantId;
  guestId: GuestId;
  key: string;
  type: GuestDocumentTypeEnum;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  documentNumber?: string | null;
  issuingCountry?: string | null;
  expiresAt?: Date | null;
  notes?: string | null;
}

export interface UpdateGuestDocumentMetadataParams {
  type?: GuestDocumentTypeEnum;
  documentNumber?: string | null;
  issuingCountry?: string | null;
  expiresAt?: Date | null;
  notes?: string | null;
}
