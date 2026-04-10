import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UserId } from '@/domain/user/entities/user.entity';
import { ShiftId } from '@/domain/shift/value-objects/shift-id.vo';

export interface CreateShiftParams {
  tenantId: TenantId;
  staffMemberId: UserId;
  propertyId: PropertyId;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  createdBy?: string;
  createdByEmail?: string;
}

export class Shift {
  private constructor(
    private readonly id: ShiftId | null,
    private readonly tenantId: TenantId,
    private readonly staffMemberId: UserId,
    private readonly propertyId: PropertyId,
    private readonly shiftDate: Date,
    private readonly startTime: string,
    private readonly endTime: string,
    private readonly startMinutes: number,
    private readonly endMinutes: number,
    private readonly createdBy: string | null,
    private readonly createdByEmail: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(params: CreateShiftParams): Shift {
    if (params.endMinutes <= params.startMinutes) {
      throw new Error('Shift end time must be after start time');
    }

    return new Shift(
      null,
      params.tenantId,
      params.staffMemberId,
      params.propertyId,
      params.shiftDate,
      params.startTime,
      params.endTime,
      params.startMinutes,
      params.endMinutes,
      params.createdBy ?? null,
      params.createdByEmail ?? null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    id: ShiftId,
    tenantId: TenantId,
    staffMemberId: UserId,
    propertyId: PropertyId,
    shiftDate: Date,
    startTime: string,
    endTime: string,
    startMinutes: number,
    endMinutes: number,
    createdBy: string | null,
    createdByEmail: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): Shift {
    return new Shift(
      id,
      tenantId,
      staffMemberId,
      propertyId,
      shiftDate,
      startTime,
      endTime,
      startMinutes,
      endMinutes,
      createdBy,
      createdByEmail,
      createdAt,
      updatedAt,
    );
  }

  getId(): ShiftId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getStaffMemberId(): UserId {
    return this.staffMemberId;
  }

  getPropertyId(): PropertyId {
    return this.propertyId;
  }

  getShiftDate(): Date {
    return this.shiftDate;
  }

  getStartTime(): string {
    return this.startTime;
  }

  getEndTime(): string {
    return this.endTime;
  }

  getStartMinutes(): number {
    return this.startMinutes;
  }

  getEndMinutes(): number {
    return this.endMinutes;
  }

  getCreatedBy(): string | null {
    return this.createdBy;
  }

  getCreatedByEmail(): string | null {
    return this.createdByEmail;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
