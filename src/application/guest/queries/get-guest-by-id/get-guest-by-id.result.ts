import { GuestStatusEnum } from '@/domain/guest/entities/guest.types';

export interface GuestDto {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmail: string;
  emails: string[];
  phones: Array<{
    number: string;
    type?: string;
    isPrimary?: boolean;
  }>;
  status: GuestStatusEnum;
  tags: string[];
  preferencesNotes: string | null;
  summary: {
    totalBookings: number;
    totalNights: number;
    totalSpend: number;
    lastStayAt: Date | null;
    lastPropertyId: string | null;
    lastUnitId: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetGuestByIdResult {
  item: GuestDto | null;
}
