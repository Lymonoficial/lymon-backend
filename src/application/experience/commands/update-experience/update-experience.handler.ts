import { UpdateExperienceCommand } from '@/application/experience/commands/update-experience/update-experience.command';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  EXPERIENCE_REPOSITORY,
  type ExperienceRepository,
} from '@/domain/experience/repositories/experience.repository';
import { ExperienceAvailabilityType } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import {
  AUDIT_LOG_EVENT,
  AuditLoggedEvent,
} from '@/infrastructure/audit/events/audit-logged.event';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@CommandHandler(UpdateExperienceCommand)
export class UpdateExperienceHandler implements ICommandHandler<
  UpdateExperienceCommand,
  void
> {
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepository: ExperienceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: UpdateExperienceCommand): Promise<void> {
    if (!this.hasAnyUpdatableField(command)) {
      throw new BadRequestException('At least one field is required to update');
    }

    const tenantId = TenantId.createFromString(command.tenantId);
    const experienceId = ExperienceId.create(command.experienceId);

    const experience = await this.experienceRepository.findById(experienceId);
    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    if (!experience.getTenantId().equals(tenantId)) {
      throw new ForbiddenException(
        'You do not have permission to edit this experience',
      );
    }

    const data = {
      name: command.name ?? experience.getName(),
      description: command.description ?? experience.getDescription(),
      priceCop: command.priceCop ?? experience.getPriceCop(),
      durationHours: command.durationHours ?? experience.getDurationHours(),
      capacity: command.capacity ?? experience.getCapacity(),
      coverImageUrl: command.coverImageUrl ?? experience.getCoverImageUrl(),
      location: command.location ?? experience.getLocation(),
      availabilityType: command.availabilityType
        ? ExperienceAvailabilityType.create(command.availabilityType)
        : experience.getAvailabilityType(),
      startAt: this.resolveDate(command.startAt, experience.getStartAt()),
      endAt: this.resolveDate(command.endAt, experience.getEndAt()),
      recurrence: command.recurrence ?? experience.getRecurrence() ?? undefined,
      blackoutRanges:
        command.blackoutRanges === undefined
          ? experience.getBlackoutRanges()
          : command.blackoutRanges.map((r) => ({
              startAt: new Date(r.startAt),
              endAt: new Date(r.endAt),
            })),
      allowStandalonePurchase:
        command.allowStandalonePurchase ??
        experience.getAllowStandalonePurchase(),
      allowReservationPurchase:
        command.allowReservationPurchase ??
        experience.getAllowReservationPurchase(),
      minNoticeHours: experience.getMinNoticeHours(),
      purchaseCutoffHours: experience.getPurchaseCutoffHours(),
    };

    try {
      experience.update(data);
    } catch (error) {
      this.rethrowAsHttpException(error);
    }

    await this.experienceRepository.save(experience);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.EXPERIENCE_UPDATED,
        AuditEntityType.EXPERIENCE,
        command.experienceId,
      ),
    );
  }

  private resolveDate(
    commandDate: string | null | undefined,
    fallback: Date | null | undefined,
  ): Date | undefined {
    if (commandDate === undefined) return fallback ?? undefined;
    return commandDate ? new Date(commandDate) : undefined;
  }

  private rethrowAsHttpException(error: unknown): never {
    if (error instanceof HttpException) throw error;
    if (error instanceof Error) throw new BadRequestException(error.message);
    throw error;
  }

  private hasAnyUpdatableField(command: UpdateExperienceCommand): boolean {
    return (
      command.name !== undefined ||
      command.description !== undefined ||
      command.priceCop !== undefined ||
      command.durationHours !== undefined ||
      command.capacity !== undefined ||
      command.coverImageUrl !== undefined ||
      command.location !== undefined ||
      command.availabilityType !== undefined ||
      command.startAt !== undefined ||
      command.endAt !== undefined ||
      command.recurrence !== undefined ||
      command.blackoutRanges !== undefined ||
      command.allowStandalonePurchase !== undefined ||
      command.allowReservationPurchase !== undefined
    );
  }
}
