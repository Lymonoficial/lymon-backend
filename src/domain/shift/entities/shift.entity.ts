import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UserId } from '@/domain/user/entities/user.entity';
import { ShiftId } from '@/domain/shift/value-objects/shift-id.vo';
import { ShiftHour } from '@/domain/shift/value-objects/shift-hour.vo';
import { ShiftDate } from '@/domain/shift/value-objects/shift-date.vo';
import type { IShiftReconstituteData } from '@/domain/shift/interfaces/shift.interface';

export interface CreateShiftParams {
  tenantId: TenantId;
  staffMemberIds: UserId[];
  propertyId: PropertyId;
  name: string;
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
  staffMemberIds?: UserId[];
  propertyId?: PropertyId | string;
  name: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  startHour?: string;
  endHour?: string;
  notes?: string;
}

export class Shift {
  private constructor(
    private readonly id: ShiftId | null,
    private readonly tenantId: TenantId,
    private staffMemberIds: UserId[],
    private propertyId: PropertyId,
    private name: string,
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
      params.name.trim(),
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

  static reconstitute(data: IShiftReconstituteData): Shift {
    return new Shift(
      data.id,
      data.tenantId,
      data.staffMemberIds,
      data.propertyId,
      data.name,
      data.startDate,
      data.endDate,
      data.startHour,
      data.endHour,
      data.startMinutes,
      data.endMinutes,
      data.notes,
      data.createdBy,
      data.createdByEmail,
      data.createdAt,
      data.updatedAt,
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

  getName(): string {
    return this.name;
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
    // Resolve parameters with fallback to current values
    const nextStaffMemberIds = this.resolveStaffMemberIds(params);
    const nextPropertyId = this.resolvePropertyId(params);
    const nextName = params.name.trim();
    const nextStartDate = this.resolveStartDate(params);
    const nextEndDate = this.resolveEndDate(params);
    const nextStartHour = params.startHour ?? this.startHour;
    const nextEndHour = params.endHour ?? this.endHour;

    // Parse and validate time values
    const startHourVO = ShiftHour.fromString(nextStartHour);
    const endHourVO = ShiftHour.fromString(nextEndHour);
    const nextStartMinutes = startHourVO.toMinutes();
    const nextEndMinutes = endHourVO.toMinutes();

    // Validate time invariants
    this.validateTimeInvariants(nextStartMinutes, nextEndMinutes);
    this.validateDateInvariants(nextStartDate, nextEndDate);

    // Check for changes that cannot happen after shift starts
    this.validateImmutableChanges(
      nextStaffMemberIds,
      nextPropertyId,
      nextName,
      nextStartDate,
      now,
    );

    // Apply updates
    this.applyUpdates({
      staffMemberIds: nextStaffMemberIds,
      propertyId: nextPropertyId,
      name: nextName,
      startDate: nextStartDate,
      endDate: nextEndDate,
      startHour: nextStartHour,
      endHour: nextEndHour,
      startMinutes: nextStartMinutes,
      endMinutes: nextEndMinutes,
      notes: params.notes,
    });

    this.updatedAt = new Date();
  }

  private resolveStaffMemberIds(params: UpdateShiftParams): UserId[] {
    if (params.staffMemberIds === undefined) {
      return this.staffMemberIds;
    }

    if (params.staffMemberIds.length === 0) {
      return this.staffMemberIds;
    }

    return params.staffMemberIds;
  }

  private resolvePropertyId(params: UpdateShiftParams): PropertyId {
    if (params.propertyId === undefined) {
      return this.propertyId;
    }

    if (typeof params.propertyId === 'string') {
      return PropertyId.create(params.propertyId);
    }

    return params.propertyId;
  }

  private resolveStartDate(params: UpdateShiftParams): Date {
    if (params.startDate === undefined || params.startDate === null) {
      return this.startDate;
    }

    if (typeof params.startDate === 'string') {
      return ShiftDate.fromString(params.startDate).getDate();
    }

    return params.startDate;
  }

  private resolveEndDate(params: UpdateShiftParams): Date | null {
    if (params.endDate === undefined) {
      return this.endDate;
    }

    if (params.endDate === null) {
      return null;
    }

    if (typeof params.endDate === 'string') {
      return ShiftDate.fromString(params.endDate).getDate();
    }

    return params.endDate;
  }

  private validateTimeInvariants(
    startMinutes: number,
    endMinutes: number,
  ): void {
    if (endMinutes <= startMinutes) {
      throw new Error('Shift end time must be after start time');
    }
  }

  private validateDateInvariants(startDate: Date, endDate: Date | null): void {
    if (endDate && endDate.getTime() < startDate.getTime()) {
      throw new Error('Shift end date cannot be before start date');
    }
  }

  private validateImmutableChanges(
    nextStaffMemberIds: UserId[],
    nextPropertyId: PropertyId,
    nextName: string,
    nextStartDate: Date,
    now: Date,
  ): void {
    const hasImmutableChangesAfterStart =
      !this.haveSameStaffMembers(nextStaffMemberIds) ||
      !this.propertyId.equals(nextPropertyId) ||
      this.name !== nextName ||
      this.startDate.getTime() !== nextStartDate.getTime();

    const shiftStartAt = new Date(
      this.startDate.getTime() + this.startMinutes * 60 * 1000,
    );
    const isPastOrActive = now.getTime() >= shiftStartAt.getTime();

    if (!isPastOrActive) {
      return;
    }

    if (hasImmutableChangesAfterStart) {
      throw new Error(
        'This shift already started or is in the past. Only endDate, startHour, endHour, and notes can be edited.',
      );
    }
  }

  private applyUpdates(updates: {
    staffMemberIds: UserId[];
    propertyId: PropertyId;
    name: string;
    startDate: Date;
    endDate: Date | null;
    startHour: string;
    endHour: string;
    startMinutes: number;
    endMinutes: number;
    notes: string | null | undefined;
  }): void {
    const shiftStartAt = new Date(
      this.startDate.getTime() + this.startMinutes * 60 * 1000,
    );
    const now = new Date();
    const canUpdateAllFields = now.getTime() < shiftStartAt.getTime();

    if (canUpdateAllFields) {
      this.staffMemberIds = updates.staffMemberIds;
      this.propertyId = updates.propertyId;
      this.name = updates.name;
      this.startDate = updates.startDate;
    }

    this.endDate = updates.endDate;
    this.startHour = updates.startHour;
    this.endHour = updates.endHour;
    this.startMinutes = updates.startMinutes;
    this.endMinutes = updates.endMinutes;

    const trimmedNotes = updates.notes?.trim() ?? null;
    this.notes = trimmedNotes;
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
