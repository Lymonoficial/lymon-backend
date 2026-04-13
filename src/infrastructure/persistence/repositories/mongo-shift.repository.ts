import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift } from '@/domain/shift/entities/shift.entity';
import { ShiftRepository } from '@/domain/shift/repositories/shift.repository';
import { ShiftId } from '@/domain/shift/value-objects/shift-id.vo';
import { ShiftDocument } from '@/infrastructure/persistence/schemas/shift.schema';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UserId } from '@/domain/user/entities/user.entity';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';

@Injectable()
export class MongoShiftRepository implements ShiftRepository {
  constructor(
    @InjectModel(ShiftDocument.name)
    private readonly shiftModel: Model<ShiftDocument>,
  ) {}

  async save(shift: Shift): Promise<string> {
    const id = shift.getId()?.toString();
    const startDate = shift.getStartDate();
    const endDate = shift.getEndDate();

    const document = {
      tenantId: new Types.ObjectId(shift.getTenantId().toString()),
      staffMemberIds: shift
        .getStaffMemberIds()
        .map((staffId) => new Types.ObjectId(staffId.toString())),
      propertyId: new Types.ObjectId(shift.getPropertyId().toString()),
      startDate,
      endDate,
      startHour: shift.getStartHour(),
      endHour: shift.getEndHour(),
      // Legacy fields for backward compatibility in existing projections.
      shiftDate: startDate,
      startTime: shift.getStartHour(),
      endTime: shift.getEndHour(),
      startMinutes: shift.getStartMinutes(),
      endMinutes: shift.getEndMinutes(),
      notes: shift.getNotes(),
      createdBy: shift.getCreatedBy(),
      createdByEmail: shift.getCreatedByEmail(),
      updatedAt: shift.getUpdatedAt(),
    };

    if (id) {
      await this.shiftModel.findByIdAndUpdate(id, document, { new: true });
      return id;
    }

    const saved = await this.shiftModel.create({
      ...document,
      createdAt: shift.getCreatedAt(),
    });

    return saved._id.toString();
  }

  async delete(id: ShiftId): Promise<void> {
    await this.shiftModel.findByIdAndDelete(id.toString());
  }

  async findById(id: ShiftId): Promise<Shift | null> {
    const doc = await this.shiftModel.findById(id.toString());
    return doc ? this.toDomain(doc) : null;
  }

  async findOverlappingByStaff(
    tenantId: TenantId,
    staffMemberId: UserId,
    shiftDate: Date,
    startMinutes: number,
    endMinutes: number,
    excludeShiftId?: ShiftId,
  ): Promise<Shift | null> {
    return this.findOverlappingByStaffInRange(
      tenantId,
      staffMemberId,
      shiftDate,
      shiftDate,
      startMinutes,
      endMinutes,
      excludeShiftId,
    );
  }

  async findOverlappingByStaffInRange(
    tenantId: TenantId,
    staffMemberId: UserId,
    startDate: Date,
    endDate: Date | null,
    startMinutes: number,
    endMinutes: number,
    excludeShiftId?: ShiftId,
  ): Promise<Shift | null> {
    const effectiveEndDate = endDate ?? this.getOpenEndedUpperBound();
    const query: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId.toString()),
      $or: [
        {
          staffMemberIds: new Types.ObjectId(staffMemberId.toString()),
        },
        {
          staffMemberId: new Types.ObjectId(staffMemberId.toString()),
        },
      ],
      $and: [
        {
          $or: [
            {
              startDate: { $lte: effectiveEndDate },
              $or: [
                { endDate: null },
                { endDate: { $exists: false } },
                { endDate: { $gte: startDate } },
              ],
            },
            {
              shiftDate: { $gte: startDate, $lte: effectiveEndDate },
            },
          ],
        },
      ],
      startMinutes: { $lt: endMinutes },
      endMinutes: { $gt: startMinutes },
    };

    if (excludeShiftId) {
      query._id = { $ne: new Types.ObjectId(excludeShiftId.toString()) };
    }

    const doc = await this.shiftModel.findOne(query);

    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: ShiftDocument): Shift {
    const staffIds =
      doc.staffMemberIds && doc.staffMemberIds.length > 0
        ? doc.staffMemberIds
        : doc.staffMemberId
          ? [doc.staffMemberId]
          : [];
    const startDate = doc.startDate ?? doc.shiftDate;
    const effectiveEndDate =
      doc.endDate !== undefined && doc.endDate !== null
        ? doc.endDate
        : (doc.shiftDate ?? null);

    return Shift.reconstitute(
      ShiftId.createFromString(doc._id.toString()),
      TenantId.createFromString(doc.tenantId.toString()),
      staffIds.map((staffId) => UserId.createFromString(staffId.toString())),
      PropertyId.create(doc.propertyId.toString()),
      startDate,
      effectiveEndDate,
      doc.startHour ?? doc.startTime,
      doc.endHour ?? doc.endTime,
      doc.startMinutes,
      doc.endMinutes,
      doc.notes ?? null,
      doc.createdBy ?? null,
      doc.createdByEmail ?? null,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  private getOpenEndedUpperBound(): Date {
    return new Date('9999-12-31T00:00:00.000Z');
  }
}
