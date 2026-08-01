import { GuestDocumentId } from '@/domain/guest-document/value-objects/guest-document-id.vo';
import { GuestDocumentTypeEnum } from '@/domain/guest-document/value-objects/guest-document-type.vo';
import {
  CreateGuestDocumentParams,
  UpdateGuestDocumentMetadataParams,
} from './guest-document.types';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { IGuestDocumentData } from '../interfaces/guest-document.interface';

export class GuestDocument {
  private constructor(
    private readonly id: GuestDocumentId | null,
    private readonly tenantId: TenantId,
    private readonly guestId: GuestId,
    private key: string,
    private type: GuestDocumentTypeEnum,
    private fileName: string,
    private mimeType: string,
    private sizeBytes: number,
    private documentNumber: string | null,
    private issuingCountry: string | null,
    private expiresAt: Date | null,
    private notes: string | null,
    private readonly uploadedBy: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {}

  static create(params: CreateGuestDocumentParams): GuestDocument {
    const key = params.key?.trim();
    if (!key) {
      throw new Error('GuestDocument key is required');
    }

    const fileName = params.fileName?.trim();
    if (!fileName) {
      throw new Error('GuestDocument fileName is required');
    }

    return new GuestDocument(
      null,
      params.tenantId,
      params.guestId,
      key,
      params.type,
      fileName,
      params.mimeType,
      params.sizeBytes,
      params.documentNumber ?? null,
      params.issuingCountry ?? null,
      params.expiresAt ?? null,
      params.notes ?? null,
      params.uploadedBy,
      new Date(),
      new Date(),
      null,
    );
  }

  static reconstitute(data: IGuestDocumentData): GuestDocument {
    return new GuestDocument(
      data.id,
      data.tenantId,
      data.guestId,
      data.key,
      data.type,
      data.fileName,
      data.mimeType,
      data.sizeBytes,
      data.documentNumber,
      data.issuingCountry,
      data.expiresAt,
      data.notes,
      data.uploadedBy,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
    );
  }

  // Getters
  getId(): GuestDocumentId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getGuestId(): GuestId {
    return this.guestId;
  }

  getKey(): string {
    return this.key;
  }

  getType(): GuestDocumentTypeEnum {
    return this.type;
  }

  getFileName(): string {
    return this.fileName;
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getSizeBytes(): number {
    return this.sizeBytes;
  }

  getDocumentNumber(): string | null {
    return this.documentNumber;
  }

  getIssuingCountry(): string | null {
    return this.issuingCountry;
  }

  getExpiresAt(): Date | null {
    return this.expiresAt;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getUploadedBy(): string {
    return this.uploadedBy;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  /**
   * Swaps the stored file and returns the previous R2 key so the caller can
   * delete the orphaned object.
   */
  replaceFile(
    key: string,
    fileName: string,
    mimeType: string,
    sizeBytes: number,
  ): string {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      throw new Error('GuestDocument key cannot be empty');
    }

    const normalizedFileName = fileName.trim();
    if (!normalizedFileName) {
      throw new Error('GuestDocument fileName cannot be empty');
    }

    const previousKey = this.key;
    this.key = normalizedKey;
    this.fileName = normalizedFileName;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
    this.touch();

    return previousKey;
  }

  /** Only the keys present are applied, so `null` clears a field and `undefined` leaves it. */
  updateMetadata(params: UpdateGuestDocumentMetadataParams): void {
    if (params.type !== undefined) {
      this.type = params.type;
    }
    if (params.documentNumber !== undefined) {
      this.documentNumber = params.documentNumber;
    }
    if (params.issuingCountry !== undefined) {
      this.issuingCountry = params.issuingCountry;
    }
    if (params.expiresAt !== undefined) {
      this.expiresAt = params.expiresAt;
    }
    if (params.notes !== undefined) {
      this.notes = params.notes;
    }
    this.touch();
  }

  isExpired(now: Date = new Date()): boolean {
    return this.expiresAt !== null && this.expiresAt.getTime() < now.getTime();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
