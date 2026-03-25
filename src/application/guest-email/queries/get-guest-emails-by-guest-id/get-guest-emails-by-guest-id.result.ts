import { GuestEmailStatusEnum } from '@/domain/guest-email/value-objects/guest-email-status.vo';

export interface GuestEmailAttachmentDto {
  url: string;
  name: string;
  type?: string;
}

export interface GuestEmailDto {
  id: string;
  guestId: string;
  subject: string;
  body: string;
  status: GuestEmailStatusEnum;
  attachments: GuestEmailAttachmentDto[];
  sentById: string | null;
  createdAt: Date;
}

export interface GetGuestEmailsByGuestIdResult {
  items: GuestEmailDto[];
}
