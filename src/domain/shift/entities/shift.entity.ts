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
  staffMemberIds: UserId[];
  propertyId: PropertyId;
  startDate: Date;
  endDate: Date | null;
  startHour: string;
  endHour: string;
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
    if (params.staffMemberIds.length === 0 && this.staffMemberIds.length > 0) {
      // Allow removing all staff assignments from update flow.
    }

    if (params.endMinutes <= params.startMinutes) {
      throw new Error('Shift end time must be after start time');
    }

    if (
      params.endDate &&
      params.endDate.getTime() < params.startDate.getTime()
    ) {
      throw new Error('Shift end date cannot be before start date');
    }

    const hasImmutableChangesAfterStart =
      !this.haveSameStaffMembers(params.staffMemberIds) ||
      !this.propertyId.equals(params.propertyId) ||
      this.startDate.getTime() !== params.startDate.getTime();

    const shiftStartAt = new Date(
      this.startDate.getTime() + this.startMinutes * 60 * 1000,
    );
    const isPastOrActive = now.getTime() >= shiftStartAt.getTime();

    if (isPastOrActive && hasImmutableChangesAfterStart) {
      throw new Error(
        'This shift already started or is in the past. Only endDate, startHour, endHour, and notes can be edited.',
      );
    }

    if (!isPastOrActive) {
      this.staffMemberIds = params.staffMemberIds;
      this.propertyId = params.propertyId;
      this.startDate = params.startDate;
    }

    this.endDate = params.endDate;
    this.startHour = params.startHour;
    this.endHour = params.endHour;
    this.startMinutes = params.startMinutes;
    this.endMinutes = params.endMinutes;

    this.notes = params.notes?.trim() ?? null;
    this.updatedAt = new Date();
  }

  private haveSameStaffMembers(nextStaffMemberIds: UserId[]): boolean {
    if (this.staffMemberIds.length !== nextStaffMemberIds.length) {
      return false;
    }

    const currentIds = new Set(this.staffMemberIds.map((id) => id.toString()));
    for (const staffId of nextStaffMemberIds) {
      if (!currentIds.has(staffId.toString())) {
        return false;
      }
    }

    return true;
  }
}
