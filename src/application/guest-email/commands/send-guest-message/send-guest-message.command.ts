export interface SendGuestMessageAttachment {
  url: string;
  name: string;
  type?: string;
}

export class SendGuestMessageCommand {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
    public readonly subject: string,
    public readonly body?: string, // Texto libre
    public readonly templateId?: string, // ID de plantilla predefinida
    public readonly attachments: SendGuestMessageAttachment[] = [],
    public readonly sentById?: string,
  ) {}
}
