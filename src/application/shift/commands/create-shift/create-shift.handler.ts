import {
  BadRequestException,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateShiftCommand } from './create-shift.command';
import { CreateShiftCommandResult } from './create-shift.result';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UserId } from '@/domain/user/entities/user.entity';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@/domain/user/repositories/user.repository';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import {
  SHIFT_REPOSITORY,
  type ShiftRepository,
} from '@/domain/shift/repositories/shift.repository';
import { Shift } from '@/domain/shift/entities/shift.entity';
import {
  EMAIL_SERVICE,
  type IEmailService,
} from '@/application/shared/services/email.service';

@CommandHandler(CreateShiftCommand)
export class CreateShiftCommandHandler implements ICommandHandler<CreateShiftCommand> {
  constructor(
    @Inject(SHIFT_REPOSITORY)
    private readonly shiftRepository: ShiftRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) {}

  async execute(
    command: CreateShiftCommand,
  ): Promise<CreateShiftCommandResult> {
    const tenantId = TenantId.createFromString(command.tenantId);
    const staffMemberId = UserId.createFromString(command.staffMemberId);
    const propertyId = PropertyId.create(command.propertyId);

    const staffMember = await this.userRepository.findById(staffMemberId);
    if (!staffMember || !staffMember.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Staff member not found for the tenant');
    }
    if (staffMember.isOwner()) {
      throw new BadRequestException(
        'Shift can only be assigned to a staff member',
      );
    }

    const property = await this.propertyRepository.findById(propertyId);
    if (!property || !property.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Property not found for the tenant');
    }

    const shiftDate = new Date(`${command.date}T00:00:00.000Z`);
    if (Number.isNaN(shiftDate.getTime())) {
      throw new BadRequestException('Invalid shift date');
    }

    const start = this.toMinutes(command.startTime);
    const end = this.toMinutes(command.endTime);

    if (end <= start) {
      throw new BadRequestException('Shift end time must be after start time');
    }

    const overlappingShift = await this.shiftRepository.findOverlappingByStaff(
      tenantId,
      staffMemberId,
      shiftDate,
      start,
      end,
    );

    if (overlappingShift) {
      throw new ConflictException(
        'The selected staff member already has an overlapping shift',
      );
    }

    const shift = Shift.create({
      tenantId,
      staffMemberId,
      propertyId,
      shiftDate,
      startTime: command.startTime,
      endTime: command.endTime,
      startMinutes: start,
      endMinutes: end,
      createdBy: command.actorId,
      createdByEmail: command.actorEmail,
    });

    const shiftId = await this.shiftRepository.save(shift);

    await this.emailService.sendEmail({
      to: [
        {
          email: staffMember.getEmail().toString(),
          name: staffMember.getEmail().toString(),
        },
      ],
      subject: 'New shift assigned',
      htmlContent: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <p>A new shift has been assigned to you.</p>
          <p><strong>Date:</strong> ${command.date}</p>
          <p><strong>Time:</strong> ${command.startTime} - ${command.endTime}</p>
          <p><strong>Property:</strong> ${property.getName()}</p>
        </div>
      `,
    });

    return new CreateShiftCommandResult(shiftId);
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
}
