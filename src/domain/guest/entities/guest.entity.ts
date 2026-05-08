import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import {
  CreateGuestParams,
  GuestIdentity,
  GuestPhone,
  GuestStatusEnum,
  GuestSummary,
} from '@/domain/guest/entities/guest.types';
import { IGuestData } from '../interfaces/guest.interface';
import { GuestPreferenceItem } from '@/domain/guest/value-objects/guest-preference-item.vo';

export class Guest {
  private constructor(
    private readonly id: GuestId | null,
    private readonly tenantId: TenantId,
    private guestAccountId: GuestAccountId | null,
    private identity: GuestIdentity,
    private firstName: string | null,
    private lastName: string | null,
    private fullName: string,
    private primaryEmail: string,
    private emails: string[],
    private phones: GuestPhone[],
    private status: GuestStatusEnum,
    private tags: string[],
    private preferences: GuestPreferenceItem[],
    private summary: GuestSummary,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(params: CreateGuestParams): Guest {
    const fullName = params.fullName?.trim();
    if (!fullName) {
      throw new Error('Guest fullName is required');
    }

    const primaryEmail = Guest.normalizeEmail(params.primaryEmail);
    const emails = Guest.buildEmails(primaryEmail, params.emails);
    const phones = params.phones ?? [];

    return new Guest(
      null,
      params.tenantId,
      params.guestAccountId ?? null,
      params.identity,
      Guest.normalizeOptionalString(params.firstName),
      Guest.normalizeOptionalString(params.lastName),
      fullName,
      primaryEmail,
      emails,
      phones,
      params.status ?? GuestStatusEnum.ACTIVE,
      Guest.uniqueStrings(params.tags ?? []),
      params.preferences ?? [],
      {
        totalBookings: 0,
        totalNights: 0,
        totalSpend: 0,
        lastStayAt: null,
        lastPropertyId: null,
        lastUnitId: null,
      },
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: IGuestData): Guest {
    return new Guest(
      data.id,
      data.tenantId,
      data.guestAccountId,
      data.identity,
      data.firstName,
      data.lastName,
      data.fullName,
      Guest.normalizeEmail(data.primaryEmail),
      Guest.buildEmails(data.primaryEmail, data.emails),
      data.phones,
      data.status,
      Guest.uniqueStrings(data.tags),
      data.preferences,
      data.summary,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateBasicInfo(
    fullName: string,
    firstName?: string | null,
    lastName?: string | null,
  ): void {
    const normalizedFullName = fullName.trim();
    if (!normalizedFullName) {
      throw new Error('Guest fullName is required');
    }

    this.fullName = normalizedFullName;
    this.firstName = Guest.normalizeOptionalString(firstName);
    this.lastName = Guest.normalizeOptionalString(lastName);
    this.touch();
  }

  setPrimaryEmail(primaryEmail: string): void {
    this.primaryEmail = Guest.normalizeEmail(primaryEmail);
    this.emails = Guest.buildEmails(this.primaryEmail, this.emails);
    this.touch();
  }

  setEmails(emails: string[]): void {
    this.emails = Guest.buildEmails(this.primaryEmail, emails);
    this.touch();
  }

  setPhones(phones: GuestPhone[]): void {
    this.phones = phones;
    this.touch();
  }

  setIdentity(identity: GuestIdentity): void {
    this.identity = identity;
    this.touch();
  }

  setStatus(status: GuestStatusEnum): void {
    this.status = status;
    this.touch();
  }

  setTags(tags: string[]): void {
    this.tags = Guest.uniqueStrings(tags);
    this.touch();
  }

  setPreferences(items: GuestPreferenceItem[]): void {
    this.preferences = items;
    this.touch();
  }

  linkToGuestAccount(guestAccountId: GuestAccountId): void {
    this.guestAccountId = guestAccountId;
    this.touch();
  }

  updateCrmSummary(summary: GuestSummary): void {
    if (
      summary.totalBookings < 0 ||
      summary.totalNights < 0 ||
      summary.totalSpend < 0
    ) {
      throw new Error('CRM summary values cannot be negative');
    }

    this.summary = summary;
    this.touch();
  }

  getId(): GuestId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getGuestAccountId(): GuestAccountId | null {
    return this.guestAccountId;
  }

  getIdentity(): GuestIdentity {
    return this.identity;
  }

  getFirstName(): string | null {
    return this.firstName;
  }

  getLastName(): string | null {
    return this.lastName;
  }

  getFullName(): string {
    return this.fullName;
  }

  getPrimaryEmail(): string {
    return this.primaryEmail;
  }

  getEmails(): string[] {
    return [...this.emails];
  }

  getPhones(): GuestPhone[] {
    return [...this.phones];
  }

  getStatus(): GuestStatusEnum {
    return this.status;
  }

  getTags(): string[] {
    return [...this.tags];
  }

  getPreferences(): GuestPreferenceItem[] {
    return [...this.preferences];
  }

  getSummary(): GuestSummary {
    return this.summary;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  private static normalizeEmail(email: string): string {
    const normalized = email?.trim().toLowerCase();
    if (!normalized) {
      throw new Error('Guest primaryEmail is required');
    }

    return normalized;
  }

  private static buildEmails(
    primaryEmail: string,
    emails?: string[],
  ): string[] {
    const normalized = (emails ?? []).map((email) =>
      Guest.normalizeEmail(email),
    );
    const all = [primaryEmail, ...normalized];
    return [...new Set(all)];
  }

  private static uniqueStrings(values: string[]): string[] {
    const normalized = values
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0);

    return [...new Set(normalized)];
  }

  private static normalizeOptionalString(value?: string | null): string | null {
    if (!value) return null;

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
