import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GuestDocument } from '@/domain/guest-document/entities/guest-document.entity';
import { GuestDocumentRepository } from '@/domain/guest-document/repositories/guest-document.repository';
import { GuestDocumentId } from '@/domain/guest-document/value-objects/guest-document-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestDocumentFileDocument } from '@/infrastructure/persistence/schemas/guest-document.schema';

@Injectable()
export class MongoGuestDocumentRepository implements GuestDocumentRepository {
  constructor(
    @InjectModel(GuestDocumentFileDocument.name)
    private readonly documentModel: Model<GuestDocumentFileDocument>,
  ) {}

  async save(guestDocument: GuestDocument): Promise<void> {
    const id = guestDocument.getId()?.toString();

    const document = {
      tenantId: new Types.ObjectId(guestDocument.getTenantId().toString()),
      guestId: new Types.ObjectId(guestDocument.getGuestId().toString()),
      key: guestDocument.getKey(),
      type: guestDocument.getType(),
      fileName: guestDocument.getFileName(),
      mimeType: guestDocument.getMimeType(),
      sizeBytes: guestDocument.getSizeBytes(),
      documentNumber: guestDocument.getDocumentNumber(),
      issuingCountry: guestDocument.getIssuingCountry(),
      expiresAt: guestDocument.getExpiresAt(),
      notes: guestDocument.getNotes(),
      uploadedBy: guestDocument.getUploadedBy(),
      updatedAt: guestDocument.getUpdatedAt(),
      deletedAt: guestDocument.getDeletedAt(),
    };

    if (id) {
      await this.documentModel.findByIdAndUpdate(id, document, { new: true });
      return;
    }

    await this.documentModel.create({
      ...document,
      createdAt: guestDocument.getCreatedAt(),
    });
  }

  async findById(
    id: GuestDocumentId,
    tenantId: TenantId,
  ): Promise<GuestDocument | null> {
    const doc = await this.documentModel.findOne({
      _id: new Types.ObjectId(id.toString()),
      tenantId: new Types.ObjectId(tenantId.toString()),
      deletedAt: null,
    });

    return doc ? this.toDomain(doc) : null;
  }

  async findByGuestId(
    guestId: GuestId,
    tenantId: TenantId,
  ): Promise<GuestDocument[]> {
    const docs = await this.documentModel
      .find({
        guestId: new Types.ObjectId(guestId.toString()),
        tenantId: new Types.ObjectId(tenantId.toString()),
        deletedAt: null,
      })
      .sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  async delete(id: GuestDocumentId, tenantId: TenantId): Promise<void> {
    await this.documentModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id.toString()),
        tenantId: new Types.ObjectId(tenantId.toString()),
      },
      { deletedAt: new Date(), updatedAt: new Date() },
    );
  }

  private toDomain(doc: GuestDocumentFileDocument): GuestDocument {
    return GuestDocument.reconstitute({
      id: GuestDocumentId.createFromString(doc._id.toString()),
      tenantId: TenantId.createFromString(doc.tenantId.toString()),
      guestId: GuestId.createFromString(doc.guestId.toString()),
      key: doc.key,
      type: doc.type,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      sizeBytes: doc.sizeBytes,
      documentNumber: doc.documentNumber,
      issuingCountry: doc.issuingCountry,
      expiresAt: doc.expiresAt,
      notes: doc.notes,
      uploadedBy: doc.uploadedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    });
  }
}
