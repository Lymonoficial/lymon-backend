import { Injectable } from '@nestjs/common';
import { UserId } from '@/domain/user/entities/user.entity';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';

export interface ShiftForAudit {
  getStaffMemberIds(): UserId[];
  getPropertyId(): PropertyId;
  getStartDate(): Date;
  getEndDate(): Date | null;
  getStartHour(): string;
  getEndHour(): string;
  getNotes(): string | null;
}

@Injectable()
export class ShiftAuditDiffService {
  snapshot(shift: ShiftForAudit): Record<string, unknown> {
    const endDate = shift.getEndDate();
    return {
      staffMemberIds: shift.getStaffMemberIds().map((id) => id.toString()),
      propertyId: shift.getPropertyId().toString(),
      startDate: this.formatDate(shift.getStartDate()),
      endDate: endDate ? this.formatDate(endDate) : null,
      startHour: shift.getStartHour(),
      endHour: shift.getEndHour(),
      notes: shift.getNotes(),
    };
  }

  diff(
    previousSnapshot: Record<string, unknown>,
    nextSnapshot: Record<string, unknown>,
  ): {
    changedFields: string[];
    previousValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
  } {
    const changedFields: string[] = [];
    const previousValue: Record<string, unknown> = {};
    const newValue: Record<string, unknown> = {};

    for (const field of Object.keys(nextSnapshot)) {
      const previousFieldValue = previousSnapshot[field];
      const nextFieldValue = nextSnapshot[field];

      if (previousFieldValue === nextFieldValue) {
        continue;
      }

      changedFields.push(field);
      previousValue[field] = previousFieldValue;
      newValue[field] = nextFieldValue;
    }

    return {
      changedFields,
      previousValue: changedFields.length > 0 ? previousValue : undefined,
      newValue: changedFields.length > 0 ? newValue : undefined,
    };
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }
}
