import { GuestEmailStatusEnum } from '@/domain/guest-email/value-objects/guest-email-status.vo';

export interface SaveGuestEmailAttachment {
  url: string;
  name: string;
  type?: string;
}

export class SaveGuestEmailCommand {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly status: GuestEmailStatusEnum,
    public readonly attachments: SaveGuestEmailAttachment[] = [],
    public readonly sentById?: string,
  ) {}
}
