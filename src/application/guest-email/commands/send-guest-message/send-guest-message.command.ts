import { GuestEmailAttachment } from '@/domain/guest-email/entities/guest-email.types';

export class SendGuestMessageCommand {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
    public readonly subject: string,
    public readonly body?: string, // Texto libre
    public readonly templateId?: string, // ID de plantilla predefinida
    public readonly attachments: GuestEmailAttachment[] = [],
    public readonly sentById?: string,
  ) {}
}
