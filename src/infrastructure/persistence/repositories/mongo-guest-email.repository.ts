import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GuestEmail } from '@/domain/guest-email/entities/guest-email.entity';
import { GuestEmailAttachment } from '@/domain/guest-email/entities/guest-email.types';
import { GuestEmailRepository } from '@/domain/guest-email/repositories/guest-email.repository';
import { GuestEmailId } from '@/domain/guest-email/value-objects/guest-email-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestEmailDocument } from '@/infrastructure/persistence/schemas/guest-email.schema';

@Injectable()
export class MongoGuestEmailRepository implements GuestEmailRepository {
  constructor(
    @InjectModel(GuestEmailDocument.name)
    private readonly emailModel: Model<GuestEmailDocument>,
  ) {}

  async save(email: GuestEmail): Promise<void> {
    const id = email.getId().toString();

    const document = {
      tenantId: new Types.ObjectId(email.getTenantId().toString()),
      guestId: new Types.ObjectId(email.getGuestId().toString()),
      subject: email.getSubject(),
      status: email.getStatus(),
      messageId: email.getMessageId(),
      attachments: email.getAttachments().map((att) => ({
        url: att.url,
        name: att.name,
        type: att.type,
      })),
      sentById: email.getSentById(),
      createdAt: email.getCreatedAt(),
    };

    await this.emailModel.findByIdAndUpdate(id, document, {
      upsert: true,
      new: true,
    });
  }

  async findById(id: GuestEmailId): Promise<GuestEmail | null> {
    const doc = await this.emailModel.findById(id.toString());
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByGuestId(
    tenantId: TenantId,
    guestId: GuestId,
  ): Promise<GuestEmail[]> {
    const docs = await this.emailModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        guestId: new Types.ObjectId(guestId.toString()),
      })
      .sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  async findByGuestIdPaginated(
    tenantId: TenantId,
    guestId: GuestId,
    page: number,
    limit: number,
  ): Promise<{ emails: GuestEmail[]; total: number }> {
    const filter = {
      tenantId: new Types.ObjectId(tenantId.toString()),
      guestId: new Types.ObjectId(guestId.toString()),
    };
    const [total, docs] = await Promise.all([
      this.emailModel.countDocuments(filter),
      this.emailModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    return { emails: docs.map((doc) => this.toDomain(doc)), total };
  }

  private toDomain(doc: GuestEmailDocument): GuestEmail {
    return GuestEmail.reconstitute(
      GuestEmailId.createFromString(doc._id),
      TenantId.createFromString(doc.tenantId.toString()),
      GuestId.createFromString(doc.guestId.toString()),
      doc.subject,

      doc.status,
      doc.attachments as GuestEmailAttachment[],
      doc.messageId,
      doc.sentById,
      doc.createdAt,
    );
  }
}
