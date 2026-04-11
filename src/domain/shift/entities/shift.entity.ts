import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UserId } from '@/domain/user/entities/user.entity';
import { ShiftId } from '@/domain/shift/value-objects/shift-id.vo';

export interface CreateShiftParams {
  tenantId: TenantId;
  staffMemberIds: UserId[];
  propertyId: PropertyId;
  startDate: Date;
  endDate?: Date | null;
  startHour: string;
  endHour: string;
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
    private staffMemberIds: UserId[],
    private propertyId: PropertyId,
    private startDate: Date,
    private endDate: Date | null,
    private startHour: string,
    private endHour: string,
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

    if (
      params.endDate &&
      params.endDate.getTime() < params.startDate.getTime()
    ) {
      throw new Error('Shift end date cannot be before start date');
    }

    return new Shift(
      null,
      params.tenantId,
      params.staffMemberIds,
      params.propertyId,
      params.startDate,
      params.endDate ?? null,
      params.startHour,
      params.endHour,
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
    staffMemberIds: UserId[],
    propertyId: PropertyId,
    startDate: Date,
    endDate: Date | null,
    startHour: string,
    endHour: string,
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
      staffMemberIds,
      propertyId,
      startDate,
      endDate,
      startHour,
      endHour,
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

  getStaffMemberIds(): UserId[] {
    return this.staffMemberIds;
  }

  getStaffMemberId(): UserId {
    return this.staffMemberIds[0];
  }

  getPropertyId(): PropertyId {
    return this.propertyId;
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date | null {
    return this.endDate;
  }

  getShiftDate(): Date {
    return this.startDate;
  }

  getStartHour(): string {
    return this.startHour;
  }

  getStartTime(): string {
    return this.startHour;
  }

  getEndHour(): string {
    return this.endHour;
  }

  getEndTime(): string {
    return this.endHour;
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
      !this.getStaffMemberId().equals(params.staffMemberId) ||
      !this.propertyId.equals(params.propertyId) ||
      this.startDate.getTime() !== params.shiftDate.getTime() ||
      this.startHour !== params.startTime ||
      this.endHour !== params.endTime ||
      this.startMinutes !== params.startMinutes ||
      this.endMinutes !== params.endMinutes;

    const shiftStartAt = new Date(
      this.startDate.getTime() + this.startMinutes * 60 * 1000,
    );
    const isPastOrActive = now.getTime() >= shiftStartAt.getTime();

    if (isPastOrActive && hasSchedulingChanges) {
      throw new Error(
        'This shift already started or is in the past. Only notes can be edited.',
      );
    }

    if (!isPastOrActive) {
      this.staffMemberIds = [params.staffMemberId];
      this.propertyId = params.propertyId;
      this.startDate = params.shiftDate;
      this.endDate = params.shiftDate;
      this.startHour = params.startTime;
      this.endHour = params.endTime;
      this.startMinutes = params.startMinutes;
      this.endMinutes = params.endMinutes;
    }

    this.notes = params.notes?.trim() ?? null;
    this.updatedAt = new Date();
  }
}
