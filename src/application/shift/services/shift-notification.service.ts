import { Injectable, Inject } from '@nestjs/common';
import {
  EMAIL_SERVICE,
  type IEmailService,
} from '@/application/shared/services/email.service';
import { EmailTemplateService } from '@/infrastructure/common/email-template.service';

export interface StaffMember {
  getTenantId(): unknown;
  isOwner(): boolean;
  getEmail(): { toString(): string };
}

export interface ShiftForNotification {
  getName(): string;
  getEndDate(): Date | null;
  getStartDate(): Date;
  getStartHour(): string;
  getEndHour(): string;
  getNotes(): string | null;
}

export interface PropertyForNotification {
  getName(): string;
}

@Injectable()
export class ShiftNotificationService {
  constructor(
    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  async sendShiftUpdatedEmail(
    staffMembers: StaffMember[],
    shift: ShiftForNotification,
    property: PropertyForNotification,
  ): Promise<void> {
    const htmlContent = this.emailTemplateService.renderShiftUpdatedTemplate({
      name: shift.getName(),
      startDate: shift.getStartDate(),
      endDate: shift.getEndDate(),
      startHour: shift.getStartHour(),
      endHour: shift.getEndHour(),
      propertyName: property.getName(),
      notes: shift.getNotes(),
    });

    await this.emailService.sendEmail({
      to: staffMembers.map((staffMember) => ({
        email: staffMember.getEmail().toString(),
        name: staffMember.getEmail().toString(),
      })),
      subject: 'Shift updated',
      htmlContent,
    });
  }
}
