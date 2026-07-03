import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage, Types } from 'mongoose';
import type {
  ExperiencePurchaseRepository,
  TenantExperiencePurchaseFilters,
  TenantExperiencePurchaseReadModel,
} from '@/domain/experience-purchase/repositories/experience-purchase.repository';
import { ExperiencePurchase } from '@/domain/experience-purchase/entities/experience-purchase.entity';
import { ExperiencePurchaseId } from '@/domain/experience-purchase/value-objects/experience-purchase-id.vo';
import {
  ExperiencePurchaseStatus,
  ExperiencePurchaseStatusEnum,
} from '@/domain/experience-purchase/value-objects/experience-purchase-status.vo';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { ExperiencePurchaseDocument } from '../schemas/experience-purchase.schema';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';

@Injectable()
export class MongoExperiencePurchaseRepository implements ExperiencePurchaseRepository {
  constructor(
    @InjectModel(ExperiencePurchaseDocument.name)
    private readonly purchaseModel: Model<ExperiencePurchaseDocument>,
  ) {}

  async save(
    purchase: ExperiencePurchase,
    ctx?: TransactionContextData,
  ): Promise<string> {
    const id = purchase.getId()?.toString();
    const doc = {
      tenantId: new Types.ObjectId(purchase.getTenantId().toString()),
      guestAccountId: new Types.ObjectId(
        purchase.getGuestAccountId().toString(),
      ),
      experienceId: new Types.ObjectId(purchase.getExperienceId().toString()),
      reservationId: purchase.getReservationId()
        ? new Types.ObjectId(purchase.getReservationId()!)
        : null,
      selectedDate: purchase.getSelectedDate() ?? null,
      quantity: purchase.getQuantity(),
      unitPriceCop: purchase.getUnitPriceCop(),
      totalPriceCop: purchase.getTotalPriceCop(),
      status: purchase.getStatus().toString(),
      paymentReference: purchase.getPaymentReference() ?? null,
    };

    const options = ctx ? { session: ctx as ClientSession } : undefined;

    if (id) {
      await this.purchaseModel.findByIdAndUpdate(id, doc, options);
      return id;
    }

    const created = await this.purchaseModel.create(
      [
        {
          ...doc,
          createdAt: purchase.getCreatedAt(),
          updatedAt: purchase.getUpdatedAt(),
        },
      ],
      options,
    );

    return created[0]._id.toString();
  }

  async findById(id: ExperiencePurchaseId): Promise<ExperiencePurchase | null> {
    const doc = await this.purchaseModel.findById(id.toString());
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByGuestAccountId(
    guestAccountId: GuestAccountId,
    tenantId: TenantId,
    page: number,
    limit: number,
  ): Promise<ExperiencePurchase[]> {
    const docs = await this.purchaseModel
      .find({
        guestAccountId: new Types.ObjectId(guestAccountId.toString()),
        tenantId: new Types.ObjectId(tenantId.toString()),
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return docs.map((d) => this.toDomainEntity(d));
  }

  async countByGuestAccountId(
    guestAccountId: GuestAccountId,
    tenantId: TenantId,
  ): Promise<number> {
    return this.purchaseModel.countDocuments({
      guestAccountId: new Types.ObjectId(guestAccountId.toString()),
      tenantId: new Types.ObjectId(tenantId.toString()),
    });
  }

  async findByTenantIdPaginated(
    tenantId: TenantId,
    page: number,
    limit: number,
    filters?: TenantExperiencePurchaseFilters,
  ): Promise<TenantExperiencePurchaseReadModel[]> {
    const match = this.buildTenantFilter(tenantId, filters);
    const docs =
      await this.purchaseModel.aggregate<TenantPurchaseAggregationResult>([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        ...this.tenantPurchaseLookupStages(),
      ]);

    return docs.map((doc) => ({
      id: doc._id.toString(),
      experienceId: doc.experienceId.toString(),
      experienceName: doc.experience?.name ?? 'Unknown experience',
      guestAccountId: doc.guestAccountId.toString(),
      guestName: doc.guestAccount?.fullName ?? 'Unknown guest',
      purchasedAt: doc.createdAt,
      scheduledDate: doc.selectedDate ?? null,
      quantity: doc.quantity,
      totalPriceCop: doc.totalPriceCop,
      status: doc.status,
    }));
  }

  async countByTenantId(
    tenantId: TenantId,
    filters?: TenantExperiencePurchaseFilters,
  ): Promise<number> {
    return this.purchaseModel.countDocuments(
      this.buildTenantFilter(tenantId, filters),
    );
  }

  async countConfirmedByExperienceAndDate(
    experienceId: string,
    selectedDate: Date | null,
  ): Promise<number> {
    const filter: Record<string, unknown> = {
      experienceId: new Types.ObjectId(experienceId),
      status: ExperiencePurchaseStatusEnum.CONFIRMED,
    };
    if (selectedDate) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      filter.selectedDate = { $gte: start, $lte: end };
    } else {
      filter.selectedDate = null;
    }
    return this.purchaseModel.countDocuments(filter);
  }

  private buildTenantFilter(
    tenantId: TenantId,
    filters?: TenantExperiencePurchaseFilters,
  ): TenantPurchaseFilter {
    const match: TenantPurchaseFilter = {
      tenantId: new Types.ObjectId(tenantId.toString()),
    };

    if (filters?.experienceId) {
      match.experienceId = new Types.ObjectId(filters.experienceId);
    }

    if (filters?.status) {
      match.status = filters.status;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      const selectedDate: Record<string, Date> = {};
      if (filters.dateFrom) {
        selectedDate.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        selectedDate.$lte = filters.dateTo;
      }
      match.selectedDate = selectedDate;
    }

    return match;
  }

  private tenantPurchaseLookupStages(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'experiences',
          localField: 'experienceId',
          foreignField: '_id',
          as: 'experience',
        },
      },
      {
        $unwind: {
          path: '$experience',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'guest_accounts',
          localField: 'guestAccountId',
          foreignField: '_id',
          as: 'guestAccount',
        },
      },
      {
        $unwind: {
          path: '$guestAccount',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  private toDomainEntity(doc: ExperiencePurchaseDocument): ExperiencePurchase {
    return ExperiencePurchase.reconstitute({
      id: ExperiencePurchaseId.createFromString(doc._id.toString()),
      tenantId: TenantId.createFromString(doc.tenantId.toString()),
      guestAccountId: GuestAccountId.createFromString(
        doc.guestAccountId.toString(),
      ),
      experienceId: ExperienceId.create(doc.experienceId.toString()),
      reservationId: doc.reservationId?.toString() ?? null,
      selectedDate: doc.selectedDate ?? null,
      quantity: doc.quantity,
      unitPriceCop: doc.unitPriceCop,
      totalPriceCop: doc.totalPriceCop,
      status: ExperiencePurchaseStatus.create(
        doc.status as ExperiencePurchaseStatusEnum,
      ),
      paymentReference: doc.paymentReference ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}

interface TenantPurchaseAggregationResult {
  _id: Types.ObjectId;
  experienceId: Types.ObjectId;
  experience?: {
    name?: string;
  };
  guestAccountId: Types.ObjectId;
  guestAccount?: {
    fullName?: string;
  };
  createdAt: Date;
  selectedDate: Date | null;
  quantity: number;
  totalPriceCop: number;
  status: string;
}

type TenantPurchaseFilter = {
  tenantId: Types.ObjectId;
  experienceId?: Types.ObjectId;
  status?: ExperiencePurchaseStatusEnum;
  selectedDate?: {
    $gte?: Date;
    $lte?: Date;
  };
};
