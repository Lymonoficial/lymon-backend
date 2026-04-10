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

    const document = {
      tenantId: new Types.ObjectId(shift.getTenantId().toString()),
      staffMemberId: new Types.ObjectId(shift.getStaffMemberId().toString()),
      propertyId: new Types.ObjectId(shift.getPropertyId().toString()),
      shiftDate: shift.getShiftDate(),
      startTime: shift.getStartTime(),
      endTime: shift.getEndTime(),
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
    const query: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId.toString()),
      staffMemberId: new Types.ObjectId(staffMemberId.toString()),
      shiftDate,
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
    return Shift.reconstitute(
      ShiftId.createFromString(doc._id.toString()),
      TenantId.createFromString(doc.tenantId.toString()),
      UserId.createFromString(doc.staffMemberId.toString()),
      PropertyId.create(doc.propertyId.toString()),
      doc.shiftDate,
      doc.startTime,
      doc.endTime,
      doc.startMinutes,
      doc.endMinutes,
      doc.notes ?? null,
      doc.createdBy ?? null,
      doc.createdByEmail ?? null,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
