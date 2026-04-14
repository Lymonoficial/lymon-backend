import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import type {
  GuestReservationFilters,
  GuestReservationQueryOptions,
  GuestReservationsReadRepository,
} from '@/domain/reservation/repositories/guest-reservations-read.repository';
import type { ReservationRepository } from '@/domain/reservation/repositories/reservation.repository';
import { Reservation } from '@/domain/reservation/entities/reservation.entity';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { DateRange } from '@/domain/reservation/value-objects/date-range.vo';
import {
  ReservationSource,
  ReservationSourceEnum,
} from '@/domain/reservation/value-objects/reservation-source.vo';
import {
  ReservationStatus,
  ReservationStatusEnum,
} from '@/domain/reservation/value-objects/reservation-status.vo';
import { ReservationDocument } from '../schemas/reservation.schema';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

const ACTIVE_RESERVATION_STATUSES = [
  ReservationStatusEnum.PENDING,
  ReservationStatusEnum.CONFIRMED,
  ReservationStatusEnum.CHECKED_IN,
];

@Injectable()
export class MongoReservationRepository
  implements ReservationRepository, GuestReservationsReadRepository
{
  constructor(
    @InjectModel(ReservationDocument.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async save(
    reservation: Reservation,
    ctx?: TransactionContextData,
  ): Promise<string> {
    const session = ctx as ClientSession | undefined;
    const id = reservation.getId()?.toString();

    const document = {
      tenantId: new Types.ObjectId(reservation.getTenantId().toString()),
      propertyId: new Types.ObjectId(reservation.getPropertyId().toString()),
      unitId: new Types.ObjectId(reservation.getUnitId().toString()),
      guestId: new Types.ObjectId(reservation.getGuestId().toString()),
      checkIn: reservation.getDateRange().getCheckIn(),
      checkOut: reservation.getDateRange().getCheckOut(),
      source: reservation.getSource().toString(),
      status: reservation.getStatus().toString(),
      guestsCount: reservation.getGuestsCount(),
      pricePerNight: reservation.getPricePerNight(),
      totalPrice: reservation.getTotalPrice(),
      notes: reservation.getNotes(),
      ...(reservation.getExternalReservationId()
        ? { externalReservationId: reservation.getExternalReservationId() }
        : {}),
      cancelledAt: reservation.getCancelledAt(),
      cancellationReason: reservation.getCancellationReason(),
      checkInActualAt: reservation.getCheckInActualAt(),
      checkOutActualAt: reservation.getCheckOutActualAt(),
      updatedAt: reservation.getUpdatedAt(),
    };

    if (id) {
      await this.reservationModel.findByIdAndUpdate(id, document, {
        new: true,
        session,
      });
      return id;
    }

    const newDoc = new this.reservationModel({
      ...document,
      createdAt: reservation.getCreatedAt(),
    });
    const saved = session
      ? await newDoc.save({ session })
      : await newDoc.save();
    return saved._id.toHexString();
  }

  async findById(id: ReservationId): Promise<Reservation | null> {
    const doc = await this.reservationModel.findById(id.toString());
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByTenantId(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<Reservation[]> {
    const skip = (page - 1) * limit;
    const docs = await this.reservationModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((d) => this.toDomain(d));
  }

  async findByPropertyId(
    tenantId: string,
    propertyId: string,
    page: number,
    limit: number,
  ): Promise<Reservation[]> {
    const skip = (page - 1) * limit;
    const docs = await this.reservationModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        propertyId: new Types.ObjectId(propertyId),
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((d) => this.toDomain(d));
  }

  async findByUnitId(
    tenantId: string,
    unitId: string,
    page: number,
    limit: number,
  ): Promise<Reservation[]> {
    const skip = (page - 1) * limit;
    const docs = await this.reservationModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        unitId: new Types.ObjectId(unitId),
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return docs.map((d) => this.toDomain(d));
  }

  async findByGuestId(
    tenantId: string,
    guestId: string,
    page: number,
    limit: number,
    sortBy: 'checkIn' | 'createdAt' = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc',
  ): Promise<Reservation[]> {
    const skip = (page - 1) * limit;
    const sortField = sortBy === 'checkIn' ? 'checkIn' : 'createdAt';
    const sortOrder = sortDirection === 'asc' ? 1 : -1;
    const docs = await this.reservationModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        guestId: new Types.ObjectId(guestId),
      })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);
    return docs.map((d) => this.toDomain(d));
  }

  async countByGuestId(tenantId: string, guestId: string): Promise<number> {
    return this.reservationModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
      guestId: new Types.ObjectId(guestId),
    });
  }

  async findByGuestIds(
    guestIds: string[],
    options: GuestReservationQueryOptions,
  ): Promise<Reservation[]> {
    if (guestIds.length === 0) {
      return [];
    }

    const skip = (options.page - 1) * options.limit;
    let sortField: 'status' | 'createdAt' | 'checkIn' = 'checkIn';
    if (options.sortBy === 'status') {
      sortField = 'status';
    }
    if (options.sortBy === 'createdAt') {
      sortField = 'createdAt';
    }
    const sortDirection = options.sortOrder === 'asc' ? 1 : -1;

    const guestObjectIds = guestIds.map(
      (guestId) => new Types.ObjectId(guestId),
    );
    const filters = this.buildGuestFilters(guestObjectIds, options);

    const docs = await this.reservationModel
      .find(filters)
      .sort({ [sortField]: sortDirection, createdAt: -1 })
      .skip(skip)
      .limit(options.limit);

    return docs.map((d) => this.toDomain(d));
  }

  async countByGuestIds(
    guestIds: string[],
    filters?: GuestReservationFilters,
  ): Promise<number> {
    if (guestIds.length === 0) {
      return 0;
    }

    const guestObjectIds = guestIds.map(
      (guestId) => new Types.ObjectId(guestId),
    );
    return this.reservationModel.countDocuments(
      this.buildGuestFilters(guestObjectIds, filters),
    );
  }

  async findByUnitAndDateRange(
    unitId: UnitId,
    dateRange: DateRange,
  ): Promise<Reservation[]> {
    const docs = await this.reservationModel.find({
      unitId: new Types.ObjectId(unitId.toString()),
      checkIn: { $lt: dateRange.getCheckOut() },
      checkOut: { $gt: dateRange.getCheckIn() },
    });
    return docs.map((d) => this.toDomain(d));
  }

  async findActiveByUnitFromDate(
    unitId: UnitId,
    fromDate: Date,
  ): Promise<Reservation[]> {
    const docs = await this.reservationModel.find({
      unitId: new Types.ObjectId(unitId.toString()),
      status: {
        $nin: [ReservationStatusEnum.CANCELLED, ReservationStatusEnum.NO_SHOW],
      },
      checkOut: { $gt: fromDate },
    });

    return docs.map((d) => this.toDomain(d));
  }

  async findByExternalId(
    source: ReservationSourceEnum,
    externalId: string,
  ): Promise<Reservation | null> {
    const doc = await this.reservationModel.findOne({
      source,
      externalReservationId: externalId,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async existsActiveByPropertyId(
    tenantId: string,
    propertyId: string,
  ): Promise<boolean> {
    const count = await this.reservationModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
      propertyId: new Types.ObjectId(propertyId),
      status: { $in: ACTIVE_RESERVATION_STATUSES },
    });

    return count > 0;
  }

  async existsActiveByUnitId(
    tenantId: string,
    unitId: string,
  ): Promise<boolean> {
    const count = await this.reservationModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
      unitId: new Types.ObjectId(unitId),
      status: { $in: ACTIVE_RESERVATION_STATUSES },
    });

    return count > 0;
  }

  async countByTenantId(tenantId: string): Promise<number> {
    return this.reservationModel.countDocuments({
      tenantId: new Types.ObjectId(tenantId),
    });
  }

  async findConfirmedDueForCheckIn(date: Date): Promise<Reservation[]> {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const docs = await this.reservationModel.find({
      status: ReservationStatusEnum.CONFIRMED,
      checkIn: { $lte: endOfDay },
    });
    return docs.map((d) => this.toDomain(d));
  }

  private buildGuestFilters(
    guestIds: Types.ObjectId[],
    filters?: GuestReservationFilters,
  ): Record<string, unknown> {
    const query: Record<string, unknown> = {
      guestId: { $in: guestIds },
    };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.fromDate || filters?.toDate) {
      const checkInFilter: Record<string, Date> = {};

      if (filters.fromDate) {
        checkInFilter.$gte = filters.fromDate;
      }

      if (filters.toDate) {
        checkInFilter.$lte = filters.toDate;
      }

      query.checkIn = checkInFilter;
    }

    return query;
  }

  private toDomain(doc: ReservationDocument): Reservation {
    return Reservation.reconstitute(
      doc._id.toHexString(),
      TenantId.createFromString(doc.tenantId.toHexString()),
      PropertyId.create(doc.propertyId.toHexString()),
      UnitId.create(doc.unitId.toHexString()),
      GuestId.createFromString(doc.guestId.toHexString()),
      DateRange.reconstitute(doc.checkIn, doc.checkOut),
      ReservationSource.create(doc.source as ReservationSourceEnum),
      ReservationStatus.create(doc.status as ReservationStatusEnum),
      doc.guestsCount,
      doc.pricePerNight,
      doc.totalPrice,
      doc.notes,
      doc.externalReservationId ?? null,
      doc.cancelledAt,
      doc.cancellationReason,
      doc.checkInActualAt,
      doc.checkOutActualAt,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
