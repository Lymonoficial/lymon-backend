import { GuestDocumentId } from '@/domain/guest-document/value-objects/guest-document-id.vo';
import { GuestDocumentTypeEnum } from '@/domain/guest-document/value-objects/guest-document-type.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export interface IGuestDocumentData {
  id: GuestDocumentId;
  tenantId: TenantId;
  guestId: GuestId;
  key: string;
  type: GuestDocumentTypeEnum;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  documentNumber: string | null;
  issuingCountry: string | null;
  expiresAt: Date | null;
  notes: string | null;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
