import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateShiftCommand } from './update-shift.command';
import { UpdateShiftCommandResult } from './update-shift.result';
import {
  SHIFT_REPOSITORY,
  type ShiftRepository,
} from '@/domain/shift/repositories/shift.repository';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@/domain/user/repositories/user.repository';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import {
  EMAIL_SERVICE,
  type IEmailService,
} from '@/application/shared/services/email.service';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ShiftId } from '@/domain/shift/value-objects/shift-id.vo';
import { UserId } from '@/domain/user/entities/user.entity';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  AUDIT_LOG_EVENT,
  AuditLoggedEvent,
} from '@/infrastructure/audit/events/audit-logged.event';

@CommandHandler(UpdateShiftCommand)
export class UpdateShiftCommandHandler implements ICommandHandler<UpdateShiftCommand> {
  constructor(
    @Inject(SHIFT_REPOSITORY)
    private readonly shiftRepository: ShiftRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: UpdateShiftCommand,
  ): Promise<UpdateShiftCommandResult> {
    const tenantId = TenantId.createFromString(command.tenantId);
    const shiftId = ShiftId.createFromString(command.shiftId);

    const shift = await this.shiftRepository.findById(shiftId);
    if (!shift || !shift.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Shift not found for the tenant');
    }

    const nextStaffMemberIds = shift.getStaffMemberIds();

    const nextPropertyId = command.propertyId
      ? PropertyId.create(command.propertyId)
      : shift.getPropertyId();
    const nextStartDate = command.startDate
      ? this.parseShiftDate(command.startDate)
      : shift.getStartDate();
    const nextEndDate =
      command.endDate !== undefined
        ? command.endDate === null
          ? null
          : this.parseShiftDate(command.endDate)
        : shift.getEndDate();
    const nextStartTime = command.startHour ?? shift.getStartHour();
    const nextEndTime = command.endHour ?? shift.getEndHour();
    const nextStartMinutes = this.toMinutes(nextStartTime);
    const nextEndMinutes = this.toMinutes(nextEndTime);
    const previousSnapshot = this.getShiftSnapshot(shift);

    if (nextEndDate && nextEndDate.getTime() < nextStartDate.getTime()) {
      throw new BadRequestException(
        'Shift end date cannot be before start date',
      );
    }

    if (nextEndMinutes <= nextStartMinutes) {
      throw new BadRequestException('Shift end time must be after start time');
    }

    this.validateObjectId(command.propertyId, 'property');
    const staffMembers = await this.getStaffMembers(
      nextStaffMemberIds,
      tenantId,
    );

    const property = await this.propertyRepository.findById(nextPropertyId);
    if (!property || !property.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Property not found for the tenant');
    }

    for (const staffMemberId of nextStaffMemberIds) {
      const overlappingShift =
        await this.shiftRepository.findOverlappingByStaffInRange(
          tenantId,
          staffMemberId,
          nextStartDate,
          nextEndDate,
          nextStartMinutes,
          nextEndMinutes,
          shiftId,
        );

      if (overlappingShift) {
        throw new ConflictException(
          `Staff member ${staffMemberId.toString()} already has an overlapping shift`,
        );
      }
    }

    try {
      shift.update(
        {
          staffMemberIds: nextStaffMemberIds,
          propertyId: nextPropertyId,
          startDate: nextStartDate,
          endDate: nextEndDate,
          startHour: nextStartTime,
          endHour: nextEndTime,
          startMinutes: nextStartMinutes,
          endMinutes: nextEndMinutes,
          notes: command.notes ?? shift.getNotes() ?? undefined,
        },
        new Date(),
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const nextSnapshot = this.getShiftSnapshot(shift);
    const auditDiff = this.buildAuditDiff(previousSnapshot, nextSnapshot);

    const updatedShiftId = await this.shiftRepository.save(shift);

    if (staffMembers.length > 0) {
      await this.emailService.sendEmail({
        to: staffMembers.map((staffMember) => ({
          email: staffMember.getEmail().toString(),
          name: staffMember.getEmail().toString(),
        })),
        subject: 'Shift updated',
        htmlContent: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <p>Your shift has been updated.</p>
            <p><strong>Date range:</strong> ${this.formatDate(shift.getStartDate())} - ${shift.getEndDate() ? this.formatDate(shift.getEndDate()!) : 'No end date'}</p>
            <p><strong>Time:</strong> ${shift.getStartHour()} - ${shift.getEndHour()}</p>
            <p><strong>Property:</strong> ${property.getName()}</p>
            ${shift.getNotes() ? `<p><strong>Notes:</strong> ${shift.getNotes()}</p>` : ''}
          </div>
        `,
      });
    }

    if (command.actorId && command.actorEmail) {
      this.eventEmitter.emit(
        AUDIT_LOG_EVENT,
        new AuditLoggedEvent(
          command.tenantId,
          command.actorId,
          command.actorEmail,
          AuditAction.SHIFT_UPDATED as AuditAction,
          AuditEntityType.SHIFT as AuditEntityType,
          updatedShiftId,
          auditDiff.changedFields.length > 0
            ? { changedFields: auditDiff.changedFields }
            : undefined,
          auditDiff.previousValue,
          auditDiff.newValue,
        ),
      );
    }

    return new UpdateShiftCommandResult(
      updatedShiftId,
      'Shift updated successfully',
    );
  }

  private toMinutes(value: string): number {
    const [hoursRaw, minutesRaw] = value.split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new BadRequestException('Invalid shift time format');
    }

    return hours * 60 + minutes;
  }

  private parseShiftDate(value: string): Date {
    const shiftDate = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(shiftDate.getTime())) {
      throw new BadRequestException('Invalid shift date');
    }
    return shiftDate;
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private getShiftSnapshot(shift: {
    getStaffMemberIds(): UserId[];
    getPropertyId(): PropertyId;
    getStartDate(): Date;
    getEndDate(): Date | null;
    getStartHour(): string;
    getEndHour(): string;
    getNotes(): string | null;
  }): Record<string, unknown> {
    return {
      staffMemberIds: shift.getStaffMemberIds().map((id) => id.toString()),
      propertyId: shift.getPropertyId().toString(),
      startDate: this.formatDate(shift.getStartDate()),
      endDate: shift.getEndDate() ? this.formatDate(shift.getEndDate()!) : null,
      startHour: shift.getStartHour(),
      endHour: shift.getEndHour(),
      notes: shift.getNotes(),
    };
  }

  private buildAuditDiff(
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

  private validateObjectId(value: string | undefined, fieldName: string): void {
    if (!value) {
      return;
    }

    if (!/^[a-fA-F0-9]{24}$/.test(value)) {
      throw new BadRequestException(`Invalid ${fieldName} ID format`);
    }
  }

  private async getStaffMembers(
    staffMemberIds: UserId[],
    tenantId: TenantId,
  ): Promise<
    {
      getTenantId(): TenantId;
      isOwner(): boolean;
      getEmail(): { toString(): string };
    }[]
  > {
    const staffMembers = await Promise.all(
      staffMemberIds.map((staffMemberId) =>
        this.userRepository.findById(staffMemberId),
      ),
    );

    for (let index = 0; index < staffMembers.length; index += 1) {
      const staffMember = staffMembers[index];
      if (!staffMember || !staffMember.getTenantId().equals(tenantId)) {
        throw new NotFoundException('Staff member not found for the tenant');
      }

      if (staffMember.isOwner()) {
        throw new BadRequestException(
          'Shift can only be assigned to a staff member',
        );
      }
    }

    return staffMembers as {
      getTenantId(): TenantId;
      isOwner(): boolean;
      getEmail(): { toString(): string };
    }[];
  }

  private isInvalidEndDateType(endDate: unknown): boolean {
    return (
      endDate !== undefined && endDate !== null && typeof endDate !== 'string'
    );
  }
}
