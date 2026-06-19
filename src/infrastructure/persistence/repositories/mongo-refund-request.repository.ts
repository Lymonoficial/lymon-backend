import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RefundRequest } from '@/domain/refund/entities/refund-request.entity';
import { RefundRequestId } from '@/domain/refund/value-objects/refund-request-id.vo';
import { RefundRequestStatus } from '@/domain/refund/value-objects/refund-request-status.vo';
import type { RefundRequestRepository } from '@/domain/refund/repositories/refund-request.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ReservationId } from '@/domain/reservation/value-objects/reservation-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { RefundRequestDocument } from '@/infrastructure/persistence/schemas/refund-request.schema';

@Injectable()
export class MongoRefundRequestRepository implements RefundRequestRepository {
  constructor(
    @InjectModel(RefundRequestDocument.name)
    private readonly model: Model<RefundRequestDocument>,
  ) {}

  async save(refundRequest: RefundRequest): Promise<string> {
    const id = refundRequest.getId()?.toString();

    const document = {
      tenantId: new Types.ObjectId(refundRequest.getTenantId().toString()),
      reservationId: new Types.ObjectId(refundRequest.getReservationId().toString()),
      guestId: new Types.ObjectId(refundRequest.getGuestId().toString()),
      amount: refundRequest.getAmount(),
      status: refundRequest.getStatus().toString(),
      requestedBy: refundRequest.getRequestedBy(),
      reviewedBy: refundRequest.getReviewedBy(),
      reviewedAt: refundRequest.getReviewedAt(),
      reason: refundRequest.getReason(),
      updatedAt: refundRequest.getUpdatedAt(),
    };

    if (id) {
      await this.model.findByIdAndUpdate(id, document, { new: true });
      return id;
    }

    const created = await this.model.create({
      ...document,
      createdAt: refundRequest.getCreatedAt(),
    });
    return created._id.toString();
  }

  async findById(id: string): Promise<RefundRequest | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByTenant(
    tenantId: TenantId,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: RefundRequest[]; total: number }> {
    const filter: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId.toString()),
    };

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const [total, docs] = await Promise.all([
      this.model.countDocuments(filter),
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return {
      items: docs.map((doc) => this.toDomain(doc)),
      total,
    };
  }

  async findByReservationId(reservationId: string): Promise<RefundRequest | null> {
    const doc = await this.model.findOne({
      reservationId: new Types.ObjectId(reservationId),
    });
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: RefundRequestDocument): RefundRequest {
    return RefundRequest.reconstitute({
      id: RefundRequestId.createFromString(doc._id.toString()),
      tenantId: TenantId.createFromString(doc.tenantId.toString()),
      reservationId: ReservationId.create(doc.reservationId.toString()),
      guestId: GuestId.createFromString(doc.guestId.toString()),
      amount: doc.amount,
      status: RefundRequestStatus.create(doc.status),
      requestedBy: doc.requestedBy,
      reviewedBy: doc.reviewedBy,
      reviewedAt: doc.reviewedAt,
      reason: doc.reason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
