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

    return saved._id.toHexString();
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
    let staffIds: Types.ObjectId[] = [];
    if (doc.staffMemberIds && doc.staffMemberIds.length > 0) {
      staffIds = doc.staffMemberIds;
    } else if (doc.staffMemberId) {
      staffIds = [doc.staffMemberId];
    }
    const startDate = doc.startDate ?? doc.shiftDate;
    const effectiveEndDate = doc.endDate ?? doc.shiftDate ?? null;
    const docId = doc._id.toHexString();
    const tenantId = doc.tenantId.toHexString();
    const propertyId = doc.propertyId.toHexString();

    return Shift.reconstitute({
      id: ShiftId.createFromString(docId),
      tenantId: TenantId.createFromString(tenantId),
      staffMemberIds: staffIds.map((staffId) =>
        UserId.createFromString(staffId.toHexString()),
      ),
      propertyId: PropertyId.create(propertyId),
      startDate,
      endDate: effectiveEndDate,
      startHour: doc.startHour ?? doc.startTime,
      endHour: doc.endHour ?? doc.endTime,
      startMinutes: doc.startMinutes,
      endMinutes: doc.endMinutes,
      notes: doc.notes ?? null,
      createdBy: doc.createdBy ?? null,
      createdByEmail: doc.createdByEmail ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  private getOpenEndedUpperBound(): Date {
    return new Date('9999-12-31T00:00:00.000Z');
  }
}
