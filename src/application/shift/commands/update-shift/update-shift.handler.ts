import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
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

    const nextStaffMemberId = command.staffMemberId
      ? UserId.createFromString(command.staffMemberId)
      : shift.getStaffMemberId();
    const nextPropertyId = command.propertyId
      ? PropertyId.create(command.propertyId)
      : shift.getPropertyId();
    const nextShiftDate = command.date
      ? this.parseShiftDate(command.date)
      : shift.getShiftDate();
    const nextStartTime = command.startTime ?? shift.getStartTime();
    const nextEndTime = command.endTime ?? shift.getEndTime();
    const nextStartMinutes = this.toMinutes(nextStartTime);
    const nextEndMinutes = this.toMinutes(nextEndTime);

    if (nextEndMinutes <= nextStartMinutes) {
      throw new BadRequestException('Shift end time must be after start time');
    }

    // Validate property ID format if provided
    if (command.propertyId && !this.isValidObjectId(command.propertyId)) {
      throw new BadRequestException('Invalid property ID format');
    }

    // Validate staff member ID format if provided
    if (command.staffMemberId && !this.isValidObjectId(command.staffMemberId)) {
      throw new BadRequestException('Invalid staff member ID format');
    }

    const staffMember = await this.userRepository.findById(nextStaffMemberId);
    if (!staffMember || !staffMember.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Staff member not found for the tenant');
    }
    if (staffMember.isOwner()) {
      throw new BadRequestException(
        'Shift can only be assigned to a staff member',
      );
    }

    const property = await this.propertyRepository.findById(nextPropertyId);
    if (!property || !property.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Property not found for the tenant');
    }

    const overlappingShift = await this.shiftRepository.findOverlappingByStaff(
      tenantId,
      nextStaffMemberId,
      nextShiftDate,
      nextStartMinutes,
      nextEndMinutes,
      shiftId,
    );

    if (overlappingShift) {
      throw new ConflictException(
        'The selected staff member already has an overlapping shift',
      );
    }

    try {
      shift.update(
        {
          staffMemberId: nextStaffMemberId,
          propertyId: nextPropertyId,
          shiftDate: nextShiftDate,
          startTime: nextStartTime,
          endTime: nextEndTime,
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

    const updatedShiftId = await this.shiftRepository.save(shift);

    await this.emailService.sendEmail({
      to: [
        {
          email: staffMember.getEmail().toString(),
          name: staffMember.getEmail().toString(),
        },
      ],
      subject: 'Shift updated',
      htmlContent: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <p>Your shift has been updated.</p>
          <p><strong>Date:</strong> ${this.formatDate(shift.getShiftDate())}</p>
          <p><strong>Time:</strong> ${shift.getStartTime()} - ${shift.getEndTime()}</p>
          <p><strong>Property:</strong> ${property.getName()}</p>
          ${shift.getNotes() ? `<p><strong>Notes:</strong> ${shift.getNotes()}</p>` : ''}
        </div>
      `,
    });

    if (command.actorId && command.actorEmail) {
      this.eventEmitter.emit(
        AUDIT_LOG_EVENT,
        new AuditLoggedEvent(
          command.tenantId,
          command.actorId,
          command.actorEmail,
          AuditAction.SHIFT_UPDATED,
          AuditEntityType.SHIFT,
          updatedShiftId,
          {
            staffMemberId: shift.getStaffMemberId().toString(),
            propertyId: shift.getPropertyId().toString(),
            date: this.formatDate(shift.getShiftDate()),
            startTime: shift.getStartTime(),
            endTime: shift.getEndTime(),
          },
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

  private isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}
