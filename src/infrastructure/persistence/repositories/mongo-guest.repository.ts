import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { GuestDocument } from '@/infrastructure/persistence/schemas/guest.schema';
import { GuestTag } from '@/domain/guest-tag/entities/guest-tag.entity';
import { GuestTagId } from '@/domain/guest-tag/value-objects/guest-tag-id.vo';
import { GuestTagDocument } from '@/infrastructure/persistence/schemas/guest-tag.schema';
import { GuestPreferenceItem } from '@/domain/guest/value-objects/guest-preference-item.vo';
import { GuestPreferenceCategoryEnum } from '@/domain/guest-preference/value-objects/guest-preference-category.vo';

type PopulatedGuestDocument = Omit<GuestDocument, 'tags'> & {
  tags: GuestTagDocument[];
};

@Injectable()
export class MongoGuestRepository implements GuestRepository {
  constructor(
    @InjectModel(GuestDocument.name)
    private readonly guestModel: Model<GuestDocument>,
  ) {}

  async save(
    guest: Guest,
    transactionContext?: TransactionContextData,
  ): Promise<string> {
    const id = guest.getId()?.toString();
    const session = transactionContext as ClientSession | undefined;
    const summary = guest.getSummary();

    const document = {
      tenantId: new Types.ObjectId(guest.getTenantId().toString()),
      guestAccountId: guest.getGuestAccountId()
        ? new Types.ObjectId(guest.getGuestAccountId()!.toString())
        : null,
      identity: guest.getIdentity(),
      firstName: guest.getFirstName(),
      lastName: guest.getLastName(),
      fullName: guest.getFullName(),
      primaryEmail: guest.getPrimaryEmail(),
      emails: guest.getEmails(),
      phones: guest.getPhones(),
      status: guest.getStatus(),
      tags: guest
        .getTags()
        .filter((t) => t.getId() !== null)
        .map((t) => new Types.ObjectId(t.getId()!.toString())),
      preferences: guest.getPreferences(),
      summary: {
        totalBookings: summary.totalBookings,
        totalNights: summary.totalNights,
        totalSpend: summary.totalSpend,
        lastStayAt: summary.lastStayAt,
        lastPropertyId: summary.lastPropertyId
          ? new Types.ObjectId(summary.lastPropertyId.toString())
          : null,
        lastUnitId: summary.lastUnitId
          ? new Types.ObjectId(summary.lastUnitId.toString())
          : null,
      },
      updatedAt: guest.getUpdatedAt(),
    };

    if (id) {
      await this.guestModel.findByIdAndUpdate(id, document, {
        new: true,
        session,
      });
      return id;
    }

    const [created] = await this.guestModel.create(
      [
        {
          ...document,
          createdAt: guest.getCreatedAt(),
        },
      ],
      { session },
    );

    return created._id.toString();
  }

  async findById(id: GuestId): Promise<Guest | null> {
    const document = await this.guestModel
      .findById(id.toString())
      .populate<{ tags: GuestTagDocument[] }>('tags');
    if (!document) return null;

    return this.toDomain(document as PopulatedGuestDocument);
  }

  async findByTenantId(tenantId: TenantId): Promise<Guest[]> {
    const documents = await this.guestModel
      .find({ tenantId: new Types.ObjectId(tenantId.toString()) })
      .populate<{ tags: GuestTagDocument[] }>('tags')
      .sort({ createdAt: -1 });

    return documents.map((doc) => this.toDomain(doc as PopulatedGuestDocument));
  }

  async findByPrimaryEmail(
    tenantId: TenantId,
    primaryEmail: string,
  ): Promise<Guest | null> {
    const document = await this.guestModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId.toString()),
        primaryEmail: primaryEmail.trim().toLowerCase(),
      })
      .populate<{ tags: GuestTagDocument[] }>('tags');

    return document ? this.toDomain(document as PopulatedGuestDocument) : null;
  }

  async findByDocumentNumber(
    tenantId: TenantId,
    documentNumber: string,
  ): Promise<Guest | null> {
    const document = await this.guestModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId.toString()),
        'identity.documentNumber': documentNumber.trim(),
      })
      .populate<{ tags: GuestTagDocument[] }>('tags');
    return document ? this.toDomain(document as PopulatedGuestDocument) : null;
  }

  async findByGuestAccountId(
    tenantId: TenantId,
    guestAccountId: GuestAccountId,
  ): Promise<Guest | null> {
    const document = await this.guestModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId.toString()),
        guestAccountId: new Types.ObjectId(guestAccountId.toString()),
      })
      .populate<{ tags: GuestTagDocument[] }>('tags');
    return document ? this.toDomain(document as PopulatedGuestDocument) : null;
  }

  async findAllByGuestAccountId(
    guestAccountId: GuestAccountId,
  ): Promise<Guest[]> {
    const documents = await this.guestModel
      .find({
        guestAccountId: new Types.ObjectId(guestAccountId.toString()),
      })
      .populate<{ tags: GuestTagDocument[] }>('tags')
      .sort({ createdAt: -1 });

    return documents.map((doc) => this.toDomain(doc as PopulatedGuestDocument));
  }

  async countByTenantId(tenantId: TenantId): Promise<number> {
    return this.guestModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId.toString()),
    });
  }

  async findByTenantIdPaginated(
    tenantId: TenantId,
    page: number,
    limit: number,
    sortBy: 'createdAt' | 'fullName' | 'status',
    sortDirection: 'asc' | 'desc',
  ): Promise<{ guests: Guest[]; total: number }> {
    const filter = { tenantId: new Types.ObjectId(tenantId.toString()) };
    const sortOrder = sortDirection === 'asc' ? 1 : -1;
    const [total, documents] = await Promise.all([
      this.guestModel.countDocuments(filter),
      this.guestModel
        .find(filter)
        .populate<{ tags: GuestTagDocument[] }>('tags')
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    return {
      guests: documents.map((doc) =>
        this.toDomain(doc as PopulatedGuestDocument),
      ),
      total,
    };
  }

  async searchPaginated(
    tenantId: TenantId,
    term: string,
    page: number,
    limit: number,
  ): Promise<{ guests: Guest[]; total: number }> {
    const escapedTerm = term.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const pattern = new RegExp(escapedTerm, 'i');
    const filter = {
      tenantId: new Types.ObjectId(tenantId.toString()),
      $or: [
        { fullName: pattern },
        { firstName: pattern },
        { lastName: pattern },
        { primaryEmail: pattern },
        { emails: pattern },
        { 'identity.documentNumber': pattern },
        { 'phones.number': pattern },
      ],
    };
    const [total, documents] = await Promise.all([
      this.guestModel.countDocuments(filter),
      this.guestModel
        .find(filter)
        .populate<{ tags: GuestTagDocument[] }>('tags')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    return {
      guests: documents.map((doc) =>
        this.toDomain(doc as PopulatedGuestDocument),
      ),
      total,
    };
  }

  async search(tenantId: TenantId, term: string): Promise<Guest[]> {
    const escapedTerm = term.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const pattern = new RegExp(escapedTerm, 'i');

    const documents = await this.guestModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        $or: [
          { fullName: pattern },
          { firstName: pattern },
          { lastName: pattern },
          { primaryEmail: pattern },
          { emails: pattern },
          { 'identity.documentNumber': pattern },
          { 'phones.number': pattern },
        ],
      })
      .populate<{ tags: GuestTagDocument[] }>('tags')
      .sort({ createdAt: -1 });

    return documents.map((doc) => this.toDomain(doc as PopulatedGuestDocument));
  }

  async delete(id: GuestId): Promise<void> {
    await this.guestModel.findByIdAndDelete(id.toString());
  }

  private toDomain(document: PopulatedGuestDocument): Guest {
    const tags = (document.tags ?? []).map((tag) =>
      GuestTag.reconstitute(
        GuestTagId.createFromString(tag._id.toString()),
        tag.tenantId,
        tag.name,
        tag.createdAt,
      ),
    );

    return Guest.reconstitute({
      id: GuestId.createFromString(document._id.toString()),
      tenantId: TenantId.createFromString(document.tenantId.toString()),
      guestAccountId: document.guestAccountId
        ? GuestAccountId.createFromString(document.guestAccountId.toString())
        : null,
      identity: {
        documentType: document.identity?.documentType,
        documentNumber: document.identity?.documentNumber,
        countryCode: document.identity?.countryCode,
      },
      firstName: document.firstName,
      lastName: document.lastName,
      fullName: document.fullName,
      primaryEmail: document.primaryEmail,
      emails: document.emails ?? [],
      phones: document.phones ?? [],
      status: document.status,
      tags,
      preferences: (document.preferences ?? []).map(
        (p): GuestPreferenceItem => ({
          catalogItemId: p.catalogItemId,
          labelSnapshot: p.labelSnapshot,
          category: p.category as GuestPreferenceCategoryEnum,
        }),
      ),
      summary: {
        totalBookings: document.summary?.totalBookings ?? 0,
        totalNights: document.summary?.totalNights ?? 0,
        totalSpend: document.summary?.totalSpend ?? 0,
        lastStayAt: document.summary?.lastStayAt ?? null,
        lastPropertyId: document.summary?.lastPropertyId
          ? PropertyId.create(document.summary.lastPropertyId.toString())
          : null,
        lastUnitId: document.summary?.lastUnitId
          ? UnitId.create(document.summary.lastUnitId.toString())
          : null,
      },
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }
}
