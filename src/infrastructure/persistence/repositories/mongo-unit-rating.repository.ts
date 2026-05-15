import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UnitRating } from '@/domain/unit-rating/entities/unit-rating.entity';
import { UnitRatingRepository } from '@/domain/unit-rating/repositories/unit-rating.repository';
import { UnitRatingId } from '@/domain/unit-rating/value-objects/unit-rating-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { UnitRatingDocument } from '../schemas/unit-rating.schema';

@Injectable()
export class MongoUnitRatingRepository implements UnitRatingRepository {
  constructor(
    @InjectModel(UnitRatingDocument.name)
    private readonly unitRatingModel: Model<UnitRatingDocument>,
  ) {}

  async save(rating: UnitRating): Promise<string> {
    const id = rating.getId()?.toString();

    const document = {
      tenantId: new Types.ObjectId(rating.getTenantId().toString()),
      unitId: new Types.ObjectId(rating.getUnitId().toString()),
      guestId: new Types.ObjectId(rating.getGuestId().toString()),
      reservationId: new Types.ObjectId(rating.getReservationId().toString()),
      rate: rating.getRate(),
      message: rating.getMessage(),
      updatedAt: rating.getUpdatedAt(),
    };

    if (id) {
      await this.unitRatingModel.findByIdAndUpdate(id, document, { new: true });
      return id;
    }

    const [created] = await this.unitRatingModel.create([
      { ...document, createdAt: rating.getCreatedAt() },
    ]);
    return created._id.toString();
  }

  async findById(id: UnitRatingId): Promise<UnitRating | null> {
    const doc = await this.unitRatingModel.findOne({
      _id: id.toString(),
      deletedAt: null,
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findByReservationId(
    reservationId: ReservationId,
  ): Promise<UnitRating | null> {
    const doc = await this.unitRatingModel.findOne({
      reservationId: new Types.ObjectId(reservationId.toString()),
      deletedAt: null,
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findByUnitIdPaginated(
    unitId: UnitId,
    page: number,
    limit: number,
    sort?: 'best' | 'worst',
    filterRate?: number,
  ): Promise<{ ratings: UnitRating[]; total: number }> {
    const filter: Record<string, unknown> = {
      unitId: new Types.ObjectId(unitId.toString()),
      deletedAt: null,
    };

    if (filterRate !== undefined) {
      filter['rate'] = filterRate;
    }

    const sortQuery: Record<string, 1 | -1> =
      sort === 'best'
        ? { rate: -1, createdAt: -1 }
        : sort === 'worst'
          ? { rate: 1, createdAt: -1 }
          : { createdAt: -1 };

    const [total, docs] = await Promise.all([
      this.unitRatingModel.countDocuments(filter),
      this.unitRatingModel
        .find(filter)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit),
    ]);
    return { ratings: docs.map((d) => this.toDomain(d)), total };
  }

  async calculateAverageForUnit(unitId: UnitId): Promise<number | null> {
    const result = await this.unitRatingModel.aggregate([
      {
        $match: {
          unitId: new Types.ObjectId(unitId.toString()),
          deletedAt: null,
        },
      },
      { $group: { _id: null, avg: { $avg: '$rate' } } },
    ]);
    if (!result.length) return null;
    return Math.round(result[0].avg * 10) / 10;
  }

  private toDomain(doc: UnitRatingDocument): UnitRating {
    return UnitRating.reconstitute({
      id: UnitRatingId.create(doc._id.toString()),
      tenantId: TenantId.createFromString(doc.tenantId.toString()),
      unitId: UnitId.create(doc.unitId.toString()),
      guestId: GuestId.createFromString(doc.guestId.toString()),
      reservationId: ReservationId.create(doc.reservationId.toString()),
      rate: doc.rate,
      message: doc.message,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    });
  }
}
