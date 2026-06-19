import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestMessageChannel } from '@/domain/guest-message/value-objects/guest-message-channel.vo';
import { GuestMessageDirection } from '@/domain/guest-message/value-objects/guest-message-direction.vo';
import { GuestMessageStatus } from '@/domain/guest-message/value-objects/guest-message-status.vo';
import { GuestEmailStatusEnum } from '@/domain/guest-email/value-objects/guest-email-status.vo';
import { GuestEmailDocument } from '@/infrastructure/persistence/schemas/guest-email.schema';
import { GuestMessageDocument } from '@/infrastructure/persistence/schemas/guest-message.schema';

const STATUS_MAP: Record<GuestEmailStatusEnum, GuestMessageStatus> = {
  [GuestEmailStatusEnum.PENDING]: GuestMessageStatus.PENDING,
  [GuestEmailStatusEnum.SENT]: GuestMessageStatus.SENT,
  [GuestEmailStatusEnum.FAILED]: GuestMessageStatus.FAILED,
};

@Injectable()
export class GuestEmailBackfillMigration implements OnApplicationBootstrap {
  private readonly logger = new Logger(GuestEmailBackfillMigration.name);

  constructor(
    @InjectModel(GuestEmailDocument.name)
    private readonly emailModel: Model<GuestEmailDocument>,
    @InjectModel(GuestMessageDocument.name)
    private readonly messageModel: Model<GuestMessageDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const alreadyMigrated = await this.messageModel.exists({
      migratedFromGuestEmail: true,
    });

    if (alreadyMigrated) {
      return;
    }

    const emailDocs = await this.emailModel.find({}).lean();

    if (emailDocs.length === 0) {
      return;
    }

    const messageDocs = emailDocs.map((doc) => ({
      _id: doc._id,
      tenantId: doc.tenantId,
      guestId: doc.guestId,
      channel: GuestMessageChannel.EMAIL,
      direction: GuestMessageDirection.OUTBOUND,
      status: STATUS_MAP[doc.status] ?? GuestMessageStatus.SENT,
      from: '',
      to: [],
      reservationId: null,
      provider: null,
      providerMessageId: doc.messageId ?? null,
      templateId: null,
      sentBy: { actorId: doc.sentById ?? '', actorEmail: '' },
      attachments: doc.attachments ?? [],
      preview: doc.subject,
      body: null,
      bodyHtml: null,
      failureReason: null,
      migratedFromGuestEmail: true,
      deletedAt: null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt ?? doc.createdAt,
    }));

    try {
      await this.messageModel.insertMany(messageDocs, { ordered: false });
      this.logger.log(
        `Backfill complete: migrated ${messageDocs.length} guest_emails → guest_messages`,
      );
    } catch (error) {
      this.logger.warn(
        `Backfill insertMany partial error (duplicate _ids ignored): ${(error as Error).message}`,
      );
    }
  }
}
