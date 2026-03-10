import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';

export enum GuestStatusEnum {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  ARCHIVED = 'archived',
}

export interface GuestIdentity {
  documentType?: string;
  documentNumber?: string;
  countryCode?: string;
}

export interface GuestPhone {
  number: string;
  type?: string;
  isPrimary?: boolean;
}

export interface GuestSummary {
  totalBookings: number;
  totalNights: number;
  totalSpend: number;
  lastStayAt: Date | null;
  lastPropertyId: PropertyId | null;
  lastUnitId: UnitId | null;
}

export interface CreateGuestParams {
  tenantId: TenantId;
  guestAccountId?: GuestAccountId | null;
  identity: GuestIdentity;
  fullName: string;
  primaryEmail: string;
  firstName?: string;
  lastName?: string;
  emails?: string[];
  phones?: GuestPhone[];
  status?: GuestStatusEnum;
  tags?: string[];
  preferencesNotes?: string;
}
