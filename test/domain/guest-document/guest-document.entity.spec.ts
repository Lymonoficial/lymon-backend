import { GuestDocument } from '@/domain/guest-document/entities/guest-document.entity';
import { GuestDocumentTypeEnum } from '@/domain/guest-document/value-objects/guest-document-type.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

const TENANT_ID = '507f1f77bcf86cd799439011';
const GUEST_ID = '507f1f77bcf86cd799439012';

const makeDocument = (expiresAt: Date | null = null): GuestDocument =>
  GuestDocument.create({
    tenantId: TenantId.createFromString(TENANT_ID),
    guestId: GuestId.createFromString(GUEST_ID),
    key: `${TENANT_ID}/guest-documents/${GUEST_ID}/1700000000-passport.pdf`,
    type: GuestDocumentTypeEnum.PASSPORT,
    fileName: 'passport.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    uploadedBy: 'user-1',
    documentNumber: 'AB123456',
    issuingCountry: 'CO',
    expiresAt,
    notes: 'front page',
  });

describe('GuestDocument', () => {
  describe('isExpired', () => {
    const now = new Date('2026-07-31T12:00:00.000Z');

    it('is true when expiresAt is in the past', () => {
      expect(makeDocument(new Date('2026-07-30T12:00:00.000Z')).isExpired(now)).toBe(true);
    });

    it('is false when expiresAt is in the future', () => {
      expect(makeDocument(new Date('2026-08-01T12:00:00.000Z')).isExpired(now)).toBe(false);
    });

    it('is false when expiresAt is exactly now', () => {
      expect(makeDocument(new Date(now)).isExpired(now)).toBe(false);
    });

    it('is false when the document has no expiry', () => {
      expect(makeDocument(null).isExpired(now)).toBe(false);
    });
  });

  describe('updateMetadata', () => {
    it('applies only the keys present, clears on null and keeps on undefined', () => {
      const document = makeDocument(new Date('2027-01-01T00:00:00.000Z'));

      document.updateMetadata({
        type: GuestDocumentTypeEnum.VISA,
        documentNumber: null,
      });

      expect(document.getType()).toBe(GuestDocumentTypeEnum.VISA);
      expect(document.getDocumentNumber()).toBeNull();
      expect(document.getIssuingCountry()).toBe('CO');
      expect(document.getNotes()).toBe('front page');
      expect(document.getExpiresAt()).toEqual(new Date('2027-01-01T00:00:00.000Z'));
    });
  });

  describe('replaceFile', () => {
    it('returns the previous key and swaps the file metadata', () => {
      const document = makeDocument();
      const oldKey = document.getKey();

      const previousKey = document.replaceFile(
        `${TENANT_ID}/guest-documents/${GUEST_ID}/1700000999-passport.jpg`,
        'passport.jpg',
        'image/jpeg',
        2048,
      );

      expect(previousKey).toBe(oldKey);
      expect(document.getKey()).toContain('1700000999-passport.jpg');
      expect(document.getFileName()).toBe('passport.jpg');
      expect(document.getMimeType()).toBe('image/jpeg');
      expect(document.getSizeBytes()).toBe(2048);
    });
  });

  describe('create', () => {
    it('defaults the optional metadata to null', () => {
      const document = GuestDocument.create({
        tenantId: TenantId.createFromString(TENANT_ID),
        guestId: GuestId.createFromString(GUEST_ID),
        key: `${TENANT_ID}/guest-documents/${GUEST_ID}/1700000000-id.png`,
        type: GuestDocumentTypeEnum.ID_CARD,
        fileName: 'id.png',
        mimeType: 'image/png',
        sizeBytes: 512,
        uploadedBy: 'user-1',
      });

      expect(document.getId()).toBeNull();
      expect(document.getDocumentNumber()).toBeNull();
      expect(document.getIssuingCountry()).toBeNull();
      expect(document.getExpiresAt()).toBeNull();
      expect(document.getNotes()).toBeNull();
      expect(document.getDeletedAt()).toBeNull();
    });

    it('rejects an empty key', () => {
      expect(() =>
        GuestDocument.create({
          tenantId: TenantId.createFromString(TENANT_ID),
          guestId: GuestId.createFromString(GUEST_ID),
          key: '   ',
          type: GuestDocumentTypeEnum.OTHER,
          fileName: 'id.png',
          mimeType: 'image/png',
          sizeBytes: 512,
          uploadedBy: 'user-1',
        }),
      ).toThrow('GuestDocument key is required');
    });
  });
});
