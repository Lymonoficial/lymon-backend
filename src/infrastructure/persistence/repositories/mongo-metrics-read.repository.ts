import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MetricsReadRepository,
  CancellationRateMetrics,
} from '@/domain/metrics/repositories/metrics-read.repository';
import { ReservationDocument } from '../schemas/reservation.schema';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';

@Injectable()
export class MongoMetricsReadRepository implements MetricsReadRepository {
  constructor(
    @InjectModel(ReservationDocument.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async getCancellationRates(
    tenantId: string,
    guestId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CancellationRateMetrics> {
    const matchStage: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
      guestId: new Types.ObjectId(guestId),
      checkIn: { $gte: startDate, $lte: endDate },
    };

    interface AggregationResult {
      totals: Array<{ total: number; cancelled: number; noShow: number }>;
      bySource: Array<{
        source: string;
        total: number;
        cancelled: number;
        cancellationRate: number;
      }>;
      topReasons: Array<{ reason: string; count: number }>;
    }

    const [result] = await this.reservationModel.aggregate<AggregationResult>([
      { $match: matchStage },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                cancelled: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', ReservationStatusEnum.CANCELLED] },
                      1,
                      0,
                    ],
                  },
                },
                noShow: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', ReservationStatusEnum.NO_SHOW] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          bySource: [
            {
              $group: {
                _id: '$source',
                total: { $sum: 1 },
                cancelled: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', ReservationStatusEnum.CANCELLED] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                source: '$_id',
                total: 1,
                cancelled: 1,
                cancellationRate: {
                  $cond: [
                    { $gt: ['$total', 0] },
                    { $multiply: [{ $divide: ['$cancelled', '$total'] }, 100] },
                    0,
                  ],
                },
                _id: 0,
              },
            },
          ],
          topReasons: [
            {
              $match: {
                status: ReservationStatusEnum.CANCELLED,
                cancellationReason: { $ne: null },
              },
            },
            {
              $group: {
                _id: '$cancellationReason',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
              $project: {
                reason: '$_id',
                count: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    const totals = result.totals[0] || { total: 0, cancelled: 0, noShow: 0 };
    const totalReservations = totals.total;
    const cancelledCount = totals.cancelled;
    const noShowCount = totals.noShow;
    const cancellationRate =
      totalReservations > 0 ? (cancelledCount / totalReservations) * 100 : 0;
    const noShowRate =
      totalReservations > 0 ? (noShowCount / totalReservations) * 100 : 0;

    return {
      totalReservations,
      cancelledCount,
      noShowCount,
      cancellationRate: Number(cancellationRate.toFixed(2)),
      noShowRate: Number(noShowRate.toFixed(2)),
      bySource: result.bySource.map((s) => ({
        ...s,
        cancellationRate: Number(s.cancellationRate.toFixed(2)),
      })),
      topCancellationReasons: result.topReasons,
    };
  }
}
