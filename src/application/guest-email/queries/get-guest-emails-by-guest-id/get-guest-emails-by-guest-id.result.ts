export class GuestEmailDto {
  id: string;
  guestId: string;
  subject: string;
  status: string;
  messageId: string | null;
  attachments: {
    url: string;
    name: string;
    type?: string;
  }[];
  sentById: string | null;
  createdAt: Date;
}

export class GetGuestEmailsByGuestIdResult {
  items: GuestEmailDto[];
}
