import { GuestEmailId } from '../value-objects/guest-email-id.vo';
import { GuestEmailStatusEnum } from '../value-objects/guest-email-status.vo';
import { CreateGuestEmailParams, GuestEmailAttachment } from './guest-email.types';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

export class GuestEmail {
  private constructor(
    private readonly id: GuestEmailId | null,
    private readonly tenantId: TenantId,
    private readonly guestId: GuestId,
    private readonly subject: string,
    private readonly body: string,
    private status: GuestEmailStatusEnum,
    private attachments: GuestEmailAttachment[],
    private readonly sentById: string | null,
    private readonly createdAt: Date,
  ) {}

  static create(params: CreateGuestEmailParams): GuestEmail {
    if (!params.subject || params.subject.trim() === '') {
      throw new Error('GuestEmail subject is required');
    }
    if (!params.body || params.body.trim() === '') {
      throw new Error('GuestEmail body is required');
    }

    return new GuestEmail(
      null,
      params.tenantId,
      params.guestId,
      params.subject,
      params.body,
      params.status,
      params.attachments ?? [],
      params.sentById ?? null,
      new Date(),
    );
  }

  static reconstitute(
    id: GuestEmailId,
    tenantId: TenantId,
    guestId: GuestId,
    subject: string,
    body: string,
    status: GuestEmailStatusEnum,
    attachments: GuestEmailAttachment[],
    sentById: string | null,
    createdAt: Date,
  ): GuestEmail {
    return new GuestEmail(
      id,
      tenantId,
      guestId,
      subject,
      body,
      status,
      attachments,
      sentById,
      createdAt,
    );
  }

  // Getters
  getId(): GuestEmailId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getGuestId(): GuestId {
    return this.guestId;
  }

  getSubject(): string {
    return this.subject;
  }

  getBody(): string {
    return this.body;
  }

  getStatus(): GuestEmailStatusEnum {
    return this.status;
  }

  getAttachments(): GuestEmailAttachment[] {
    return [...this.attachments];
  }

  getSentById(): string | null {
    return this.sentById;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  updateStatus(status: GuestEmailStatusEnum): void {
    this.status = status;
  }
}
