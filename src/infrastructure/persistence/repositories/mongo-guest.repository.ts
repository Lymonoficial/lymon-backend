import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { GuestDocument } from '@/infrastructure/persistence/schemas/guest.schema';

@Injectable()
export class MongoGuestRepository implements GuestRepository {
  constructor(
    @InjectModel(GuestDocument.name)
    private readonly guestModel: Model<GuestDocument>,
  ) {}

  async save(guest: Guest, transactionContext?: unknown): Promise<string> {
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
      tags: guest.getTags(),
      preferencesNotes: guest.getPreferencesNotes(),
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
    const document = await this.guestModel.findById(id.toString());
    if (!document) return null;

    return this.toDomain(document);
  }

  async findByTenantId(tenantId: TenantId): Promise<Guest[]> {
    const documents = await this.guestModel
      .find({ tenantId: new Types.ObjectId(tenantId.toString()) })
      .sort({ createdAt: -1 });

    return documents.map((doc) => this.toDomain(doc));
  }

  async findByPrimaryEmail(
    tenantId: TenantId,
    primaryEmail: string,
  ): Promise<Guest | null> {
    const document = await this.guestModel.findOne({
      tenantId: new Types.ObjectId(tenantId.toString()),
      primaryEmail: primaryEmail.trim().toLowerCase(),
    });

    return document ? this.toDomain(document) : null;
  }

  async findByGuestAccountId(
    tenantId: TenantId,
    guestAccountId: GuestAccountId,
  ): Promise<Guest | null> {
    const document = await this.guestModel.findOne({
      tenantId: new Types.ObjectId(tenantId.toString()),
      guestAccountId: new Types.ObjectId(guestAccountId.toString()),
    });
    return document ? this.toDomain(document) : null;
  }

  async countByTenantId(tenantId: TenantId): Promise<number> {
    return this.guestModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId.toString()),
    });
  }

  async search(tenantId: TenantId, term: string): Promise<Guest[]> {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escapedTerm, 'i');

    const documents = await this.guestModel
      .find({
        tenantId: new Types.ObjectId(tenantId.toString()),
        $or: [
          { fullName: pattern },
          { primaryEmail: pattern },
          { emails: pattern },
          { 'identity.documentNumber': pattern },
          { 'phones.number': pattern },
        ],
      })
      .sort({ createdAt: -1 });

    return documents.map((doc) => this.toDomain(doc));
  }

  async delete(id: GuestId): Promise<void> {
    await this.guestModel.findByIdAndDelete(id.toString());
  }

  private toDomain(document: GuestDocument): Guest {
    return Guest.reconstitute(
      GuestId.createFromString(document._id.toString()),
      TenantId.createFromString(document.tenantId.toString()),
      document.guestAccountId
        ? GuestAccountId.createFromString(document.guestAccountId.toString())
        : null,
      {
        documentType: document.identity?.documentType,
        documentNumber: document.identity?.documentNumber,
        countryCode: document.identity?.countryCode,
      },
      document.firstName,
      document.lastName,
      document.fullName,
      document.primaryEmail,
      document.emails ?? [],
      document.phones ?? [],
      document.status,
      document.tags ?? [],
      document.preferencesNotes ?? '',
      {
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
      document.createdAt,
      document.updatedAt,
    );
  }
}
