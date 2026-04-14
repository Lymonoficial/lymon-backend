import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GuestNote } from '@/domain/guest-note/entities/guest-note.entity';
import { GuestNoteRepository } from '@/domain/guest-note/repositories/guest-note.repository';
import { GuestNoteId } from '@/domain/guest-note/value-objects/guest-note-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestNoteDocument } from '@/infrastructure/persistence/schemas/guest-note.schema';

@Injectable()
export class MongoGuestNoteRepository implements GuestNoteRepository {
  constructor(
    @InjectModel(GuestNoteDocument.name)
    private readonly noteModel: Model<GuestNoteDocument>,
  ) {}

  async save(note: GuestNote): Promise<void> {
    const id = note.getId()?.toString();

    const document = {
      tenantId: new Types.ObjectId(note.getTenantId().toString()),
      guestId: new Types.ObjectId(note.getGuestId().toString()),
      note: note.getNote(),
      type: note.getType(),
      status: note.getStatus(),
      createdBy: note.getCreatedBy(),
      updatedAt: note.getUpdatedAt(),
      deletedAt: note.getDeletedAt(),
    };

    if (id) {
      await this.noteModel.findByIdAndUpdate(id, document, { new: true });
      return;
    }

    await this.noteModel.create({
      ...document,
      createdAt: note.getCreatedAt(),
    });
  }

  async findById(
    id: GuestNoteId,
    tenantId: TenantId,
  ): Promise<GuestNote | null> {
    const doc = await this.noteModel.findOne({
      _id: new Types.ObjectId(id.toString()),
      tenantId: new Types.ObjectId(tenantId.toString()),
    });

    return doc ? this.toDomain(doc) : null;
  }

  async findByGuestId(
    guestId: GuestId,
    tenantId: TenantId,
  ): Promise<GuestNote[]> {
    const docs = await this.noteModel
      .find({
        guestId: new Types.ObjectId(guestId.toString()),
        tenantId: new Types.ObjectId(tenantId.toString()),
        deletedAt: null,
      })
      .sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  async findByGuestIdPaginated(
    guestId: GuestId,
    tenantId: TenantId,
    page: number,
    limit: number,
  ): Promise<{ notes: GuestNote[]; total: number }> {
    const filter = {
      guestId: new Types.ObjectId(guestId.toString()),
      tenantId: new Types.ObjectId(tenantId.toString()),
      deletedAt: null,
    };
    const [total, docs] = await Promise.all([
      this.noteModel.countDocuments(filter),
      this.noteModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    return { notes: docs.map((doc) => this.toDomain(doc)), total };
  }

  async delete(id: GuestNoteId, tenantId: TenantId): Promise<void> {
    await this.noteModel.deleteOne({
      _id: new Types.ObjectId(id.toString()),
      tenantId: new Types.ObjectId(tenantId.toString()),
    });
  }

  private toDomain(doc: GuestNoteDocument): GuestNote {
    return GuestNote.reconstitute(
      GuestNoteId.createFromString(doc._id.toString()),
      TenantId.createFromString(doc.tenantId.toString()),
      GuestId.createFromString(doc.guestId.toString()),
      doc.note,
      doc.type,
      doc.status,
      doc.createdBy,
      doc.createdAt,
      doc.updatedAt,
      doc.deletedAt,
    );
  }
}
