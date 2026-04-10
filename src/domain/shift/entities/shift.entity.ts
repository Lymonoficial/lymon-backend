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
  notes?: string;
  createdBy?: string;
  createdByEmail?: string;
}

export interface UpdateShiftParams {
  staffMemberId: UserId;
  propertyId: PropertyId;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  notes?: string;
}

export class Shift {
  private constructor(
    private readonly id: ShiftId | null,
    private readonly tenantId: TenantId,
    private staffMemberId: UserId,
    private propertyId: PropertyId,
    private shiftDate: Date,
    private startTime: string,
    private endTime: string,
    private startMinutes: number,
    private endMinutes: number,
    private notes: string | null,
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
      params.notes?.trim() ?? null,
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
    notes: string | null,
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
      notes,
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

  getNotes(): string | null {
    return this.notes;
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

  update(params: UpdateShiftParams, now: Date): void {
    if (params.endMinutes <= params.startMinutes) {
      throw new Error('Shift end time must be after start time');
    }

    const hasSchedulingChanges =
      !this.staffMemberId.equals(params.staffMemberId) ||
      !this.propertyId.equals(params.propertyId) ||
      this.shiftDate.getTime() !== params.shiftDate.getTime() ||
      this.startTime !== params.startTime ||
      this.endTime !== params.endTime ||
      this.startMinutes !== params.startMinutes ||
      this.endMinutes !== params.endMinutes;

    const shiftStartAt = new Date(
      this.shiftDate.getTime() + this.startMinutes * 60 * 1000,
    );
    const isPastOrActive = now.getTime() >= shiftStartAt.getTime();

    if (isPastOrActive && hasSchedulingChanges) {
      throw new Error(
        'This shift already started or is in the past. Only notes can be edited.',
      );
    }

    if (!isPastOrActive) {
      this.staffMemberId = params.staffMemberId;
      this.propertyId = params.propertyId;
      this.shiftDate = params.shiftDate;
      this.startTime = params.startTime;
      this.endTime = params.endTime;
      this.startMinutes = params.startMinutes;
      this.endMinutes = params.endMinutes;
    }

    this.notes = params.notes?.trim() ?? null;
    this.updatedAt = new Date();
  }
}
