import { UpdateExperienceCommand } from '@/application/experience/commands/update-experience/update-experience.command';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  EXPERIENCE_REPOSITORY,
  type ExperienceRepository,
} from '@/domain/experience/repositories/experience.repository';
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

    try {
      experience.update(command.changes);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }

    await this.experienceRepository.save(experience);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actor.id,
        command.actor.email,
        AuditAction.EXPERIENCE_UPDATED,
        AuditEntityType.EXPERIENCE,
        command.experienceId,
      ),
    );
  }
}
