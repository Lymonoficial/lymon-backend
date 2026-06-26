import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from '@/domain/conversation/entities/conversation.entity';
import {
  ConversationFilters,
  ConversationRepository,
} from '@/domain/conversation/repositories/conversation.repository';
import { ConversationId } from '@/domain/conversation/value-objects/conversation-id.vo';
import { ConversationDocument } from '../schemas/conversation.schema';
import { ConversationStatus } from '@/domain/conversation/value-objects/conversation-status.vo';
import { GuestMessageChannel } from '@/domain/guest-message/value-objects/guest-message-channel.vo';

@Injectable()
export class MongoConversationRepository implements ConversationRepository {
  constructor(
    @InjectModel(ConversationDocument.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async save(conversation: Conversation): Promise<void> {
    const document = {
      tenantId: new Types.ObjectId(conversation.getTenantId()),
      guestId: new Types.ObjectId(conversation.getGuestId()),
      reservationId: conversation.getReservationId(),
      channels: conversation.getChannels(),
      subject: conversation.getSubject(),
      lastMessageAt: conversation.getLastMessageAt(),
      lastMessagePreview: conversation.getLastMessagePreview(),
      unreadCountForStaff: conversation.getUnreadCountForStaff(),
      unreadCountForGuest: conversation.getUnreadCountForGuest(),
      status: conversation.getStatus(),
      createdAt: conversation.getCreatedAt(),
    };

    await this.conversationModel.findOneAndUpdate(
      { _id: conversation.getId().toString() },
      document,
      { upsert: true, new: true },
    );
  }

  async findById(id: ConversationId): Promise<Conversation | null> {
    const doc = await this.conversationModel.findById(id.toString());
    if (!doc) return null;
    return this.toDomainEntity(doc);
  }

  async findByTenantAndGuest(tenantId: string, guestId: string): Promise<Conversation | null> {
    const doc = await this.conversationModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      guestId: new Types.ObjectId(guestId),
    });
    if (!doc) return null;
    return this.toDomainEntity(doc);
  }

  async findByTenantPaginated(
    tenantId: string,
    filters: ConversationFilters,
    page: number,
    limit: number,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const filter: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
    };

    if (filters.channel) {
      filter['channels'] = filters.channel;
    }
    if (filters.status) {
      filter['status'] = filters.status;
    }
    if (filters.unreadOnly) {
      filter['unreadCountForStaff'] = { $gt: 0 };
    }

    const [total, docs] = await Promise.all([
      this.conversationModel.countDocuments(filter),
      this.conversationModel
        .find(filter)
        .sort({ lastMessageAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    return {
      conversations: docs.map((doc) => this.toDomainEntity(doc)),
      total,
    };
  }

  async findByGuestId(tenantId: string, guestId: string): Promise<Conversation[]> {
    const docs = await this.conversationModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        guestId: new Types.ObjectId(guestId),
      })
      .sort({ lastMessageAt: -1 });
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  private toDomainEntity(doc: ConversationDocument): Conversation {
    return Conversation.reconstitute({
      id: ConversationId.createFromString(doc._id),
      tenantId: doc.tenantId.toString(),
      guestId: doc.guestId.toString(),
      reservationId: doc.reservationId ?? null,
      channels: (doc.channels ?? []) as GuestMessageChannel[],
      subject: doc.subject,
      lastMessageAt: doc.lastMessageAt,
      lastMessagePreview: doc.lastMessagePreview ?? '',
      unreadCountForStaff: doc.unreadCountForStaff ?? 0,
      unreadCountForGuest: doc.unreadCountForGuest ?? 0,
      status: doc.status as ConversationStatus,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
