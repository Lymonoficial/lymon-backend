import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GuestMessage } from '@/domain/guest-message/entities/guest-message.entity';
import { GuestMessageRepository } from '@/domain/guest-message/repositories/guest-message.repository';
import { GuestMessageId } from '@/domain/guest-message/value-objects/guest-message-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestMessageDocument } from '@/infrastructure/persistence/schemas/guest-message.schema';

@Injectable()
export class MongoGuestMessageRepository implements GuestMessageRepository {
  constructor(
    @InjectModel(GuestMessageDocument.name)
    private readonly messageModel: Model<GuestMessageDocument>,
  ) {}

  async save(message: GuestMessage): Promise<void> {
    const id = message.getId().toString();

    const document = {
      tenantId: new Types.ObjectId(message.getTenantId().toString()),
      guestId: new Types.ObjectId(message.getGuestId().toString()),
      channel: message.getChannel(),
      direction: message.getDirection(),
      status: message.getStatus(),
      from: message.getFrom(),
      to: message.getTo(),
      reservationId: message.getReservationId(),
      provider: message.getProvider(),
      providerMessageId: message.getProviderMessageId(),
      templateId: message.getTemplateId(),
      sentBy: message.getSentBy(),
      attachments: message.getAttachments().map((att) => ({
        url: att.url,
        name: att.name,
        type: att.type,
      })),
      preview: message.getPreview(),
      body: message.getBody(),
      bodyHtml: message.getBodyHtml(),
      failureReason: message.getFailureReason(),
      deletedAt: message.getDeletedAt(),
      createdAt: message.getCreatedAt(),
    };

    await this.messageModel.findByIdAndUpdate(id, document, {
      upsert: true,
      new: true,
    });
  }

  async findById(id: GuestMessageId): Promise<GuestMessage | null> {
    const doc = await this.messageModel.findById(id.toString());
    if (!doc) return null;
    return this.toDomainEntity(doc);
  }

  async findByGuestId(
    tenantId: TenantId,
    guestId: GuestId,
  ): Promise<GuestMessage[]> {
    const docs = await this.messageModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        guestId: new Types.ObjectId(guestId.toString()),
      })
      .sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomainEntity(doc));
  }

  async findByGuestIdPaginated(
    tenantId: TenantId,
    guestId: GuestId,
    page: number,
    limit: number,
  ): Promise<{ messages: GuestMessage[]; total: number }> {
    const filter = {
      tenantId: new Types.ObjectId(tenantId.toString()),
      guestId: new Types.ObjectId(guestId.toString()),
    };
    const [total, docs] = await Promise.all([
      this.messageModel.countDocuments(filter),
      this.messageModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    return { messages: docs.map((doc) => this.toDomainEntity(doc)), total };
  }

  private toDomainEntity(doc: GuestMessageDocument): GuestMessage {
    return GuestMessage.reconstitute({
      id: GuestMessageId.createFromString(doc._id),
      tenantId: TenantId.createFromString(doc.tenantId.toString()),
      guestId: GuestId.createFromString(doc.guestId.toString()),
      channel: doc.channel,
      direction: doc.direction,
      status: doc.status,
      from: doc.from ?? '',
      to: doc.to ?? [],
      reservationId: doc.reservationId ?? null,
      provider: doc.provider ?? null,
      providerMessageId: doc.providerMessageId ?? null,
      templateId: doc.templateId ?? null,
      sentBy: doc.sentBy,
      attachments: doc.attachments,
      preview: doc.preview ?? '',
      body: doc.body ?? null,
      bodyHtml: doc.bodyHtml ?? null,
      failureReason: doc.failureReason ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt ?? null,
    });
  }
}
