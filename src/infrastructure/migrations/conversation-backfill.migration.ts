import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ConversationDocument } from '@/infrastructure/persistence/schemas/conversation.schema';
import { GuestMessageDocument } from '@/infrastructure/persistence/schemas/guest-message.schema';
import { ConversationStatus } from '@/domain/conversation/value-objects/conversation-status.vo';

const BATCH_SIZE = 500;

@Injectable()
export class ConversationBackfillMigration implements OnApplicationBootstrap {
  private readonly logger = new Logger(ConversationBackfillMigration.name);

  constructor(
    @InjectModel(ConversationDocument.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(GuestMessageDocument.name)
    private readonly messageModel: Model<GuestMessageDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const alreadyMigrated = await this.conversationModel.exists({});
    if (alreadyMigrated) {
      this.logger.log('Conversation backfill already done — skipping');
      return;
    }

    this.logger.log('Starting conversation backfill migration...');

    const groups = await this.messageModel.aggregate([
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: { tenantId: '$tenantId', guestId: '$guestId' },
          subject: { $first: '$preview' },
          lastMessageAt: { $max: '$createdAt' },
          lastMessagePreview: { $last: '$preview' },
          channels: { $addToSet: '$channel' },
          messageIds: { $push: '$_id' },
        },
      },
    ]);

    if (groups.length === 0) {
      this.logger.log('No guest messages found — nothing to backfill');
      return;
    }

    const conversationDocs = groups.map((g) => ({
      _id: uuidv4(),
      tenantId: g._id.tenantId,
      guestId: g._id.guestId,
      reservationId: null,
      channels: g.channels,
      subject: g.subject ?? '',
      lastMessageAt: g.lastMessageAt ?? new Date(),
      lastMessagePreview: g.lastMessagePreview ?? '',
      unreadCountForStaff: 0,
      unreadCountForGuest: 0,
      status: ConversationStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await this.conversationModel.insertMany(conversationDocs, { ordered: false });

    for (let i = 0; i < groups.length; i += BATCH_SIZE) {
      const batch = groups.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((g, idx) =>
          this.messageModel.updateMany(
            { _id: { $in: g.messageIds } },
            { $set: { conversationId: conversationDocs[i + idx]._id } },
          ),
        ),
      );
    }

    this.logger.log(`Conversation backfill done — ${conversationDocs.length} conversations created`);
  }
}
