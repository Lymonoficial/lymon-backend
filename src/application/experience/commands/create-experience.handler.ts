import { CreateExperienceCommand } from '@/application/experience/commands/create-experience.command';
import { CreateExperienceResult } from '@/application/experience/commands/create-experience.result';
import { Experience } from '@/domain/experience/entities/experience.entity';
import {
  EXPERIENCE_REPOSITORY,
  type ExperienceRepository,
} from '@/domain/experience/repositories/experience.repository';
import { ExperienceAvailabilityType } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategory } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceScope } from '@/domain/experience/value-objects/experience-scope.vo';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';
import {
  PROPERTY_REPOSITORY,
  type PropertyRepository,
} from '@/domain/property/repositories/property.repository';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import {
  UNIT_REPOSITORY,
  type UnitRepository,
} from '@/domain/unit/repositories/unit.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import {
  AUDIT_LOG_EVENT,
  AuditLoggedEvent,
} from '@/infrastructure/audit/events/audit-logged.event';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@CommandHandler(CreateExperienceCommand)
export class CreateExperienceHandler implements ICommandHandler<CreateExperienceCommand> {
  constructor(
    @Inject(EXPERIENCE_REPOSITORY)
    private readonly experienceRepository: ExperienceRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: CreateExperienceCommand,
  ): Promise<CreateExperienceResult> {
    const { tenantId, scope, propertyId, unitIds, experience } =
      this.buildDomainObjects(command);

    if (scope.isPropertyScope() && !propertyId) {
      throw new BadRequestException(
        'propertyId is required for PROPERTY scope',
      );
    }

    const property = propertyId
      ? await this.propertyRepository.findById(propertyId)
      : null;

    if (propertyId && !property) {
      throw new NotFoundException('Property not found');
    }

    if (property && !property.getTenantId().equals(tenantId)) {
      throw new NotFoundException('Property not found for current tenant');
    }

    if (propertyId) {
      const duplicatedName =
        await this.experienceRepository.existsByPropertyIdAndName(
          propertyId,
          command.name,
        );

      if (duplicatedName) {
        throw new ConflictException(
          'An experience with this name already exists for this property',
        );
      }
    }

    if (unitIds.length > 0) {
      if (!propertyId) {
        throw new BadRequestException('unitIds require propertyId');
      }

      await this.validateUnitsBelongToPropertyAndTenant(
        unitIds,
        propertyId,
        tenantId,
      );
    }

    const experienceId = await this.experienceRepository.save(experience);

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.EXPERIENCE_CREATED,
        AuditEntityType.EXPERIENCE,
        experienceId,
      ),
    );

    return new CreateExperienceResult(experienceId);
  }

  private async validateUnitsBelongToPropertyAndTenant(
    unitIds: UnitId[],
    propertyId: PropertyId,
    tenantId: TenantId,
  ): Promise<void> {
    for (const unitId of unitIds) {
      const unit = await this.unitRepository.findById(unitId);

      if (!unit) {
        throw new NotFoundException(`Unit not found: ${unitId.toString()}`);
      }

      if (!unit.getTenantId().equals(tenantId)) {
        throw new BadRequestException(
          `Unit does not belong to current tenant: ${unitId.toString()}`,
        );
      }

      if (!unit.getPropertyId().equals(propertyId)) {
        throw new BadRequestException(
          `Unit does not belong to selected property: ${unitId.toString()}`,
        );
      }
    }
  }

  private buildDomainObjects(command: CreateExperienceCommand): {
    tenantId: TenantId;
    scope: ExperienceScope;
    propertyId?: PropertyId;
    unitIds: UnitId[];
    experience: Experience;
  } {
    try {
      const tenantId = TenantId.createFromString(command.tenantId);
      const scope = ExperienceScope.create(command.scope);
      const propertyId = command.propertyId
        ? PropertyId.create(command.propertyId)
        : undefined;
      const unitIds = (command.unitIds ?? []).map((unitId) =>
        UnitId.create(unitId),
      );

      const experience = Experience.create({
        tenantId,
        scope,
        propertyId,
        unitIds,
        name: command.name,
        description: command.description,
        category: ExperienceCategory.create(command.category),
        priceCop: command.priceCop,
        durationHours: command.durationHours,
        capacity: command.capacity,
        coverImageUrl: command.coverImageUrl,
        location: {
          label: command.location.label,
          address: command.location.address,
          lat: command.location.lat,
          lng: command.location.lng,
        },
        availabilityType: ExperienceAvailabilityType.create(
          command.availabilityType,
        ),
        startAt: command.startAt ? new Date(command.startAt) : undefined,
        endAt: command.endAt ? new Date(command.endAt) : undefined,
        recurrence: command.recurrence,
        blackoutRanges: command.blackoutRanges?.map((range) => ({
          startAt: new Date(range.startAt),
          endAt: new Date(range.endAt),
        })),
        allowStandalonePurchase: command.allowStandalonePurchase,
        allowReservationPurchase: command.allowReservationPurchase,
      });

      return {
        tenantId,
        scope,
        propertyId,
        unitIds,
        experience,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
