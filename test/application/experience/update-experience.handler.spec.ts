import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateExperienceHandler } from '@/application/experience/commands/update-experience/update-experience.handler';
import { UpdateExperienceCommand } from '@/application/experience/commands/update-experience/update-experience.command';
import { Experience } from '@/domain/experience/entities/experience.entity';
import { ExperienceRepository } from '@/domain/experience/repositories/experience.repository';
import {
  ExperienceAvailabilityType,
  ExperienceAvailabilityTypeEnum,
} from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategory } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { ExperienceScope } from '@/domain/experience/value-objects/experience-scope.vo';
import { ExperienceStatus } from '@/domain/experience/value-objects/experience-status.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { createExperienceRepositoryMock } from '@test/shared/mocks/repositories/experience-repository.mock';
import { createEventEmitterMock } from '@test/shared/mocks/services/event-emitter.mock';

const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c0';
const OTHER_TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9ff';
const EXPERIENCE_ID = '65f1a1a2b3c4d5e6f7a8b9c5';

function makeExperience(overrides?: { tenantId?: string }): Experience {
  return Experience.reconstitute({
    id: ExperienceId.create(EXPERIENCE_ID),
    tenantId: TenantId.createFromString(overrides?.tenantId ?? TENANT_ID),
    scope: ExperienceScope.create('PROPERTY'),
    propertyId: PropertyId.create('65f1a1a2b3c4d5e6f7a8b9c1'),
    unitIds: [UnitId.create('65f1a1a2b3c4d5e6f7a8b9c8')],
    name: 'Airport transfer',
    description: 'Private transfer service',
    category: ExperienceCategory.create('TRANSPORTATION'),
    priceCop: 120000,
    durationHours: 2,
    capacity: 8,
    coverImageUrl: 'https://image.example.com/cover.jpg',
    location: {
      label: 'Main lobby',
      lat: 4.6097,
      lng: -74.0817,
    },
    availabilityType: ExperienceAvailabilityType.create(
      ExperienceAvailabilityTypeEnum.DATE_RANGE,
    ),
    startAt: new Date('2099-01-10T10:00:00.000Z'),
    endAt: new Date('2099-01-20T10:00:00.000Z'),
    recurrence: undefined,
    blackoutRanges: [],
    allowStandalonePurchase: true,
    allowReservationPurchase: true,
    minNoticeHours: 2,
    purchaseCutoffHours: 24,
    status: ExperienceStatus.create('ACTIVE'),
    createdAt: new Date('2099-01-01T00:00:00.000Z'),
    updatedAt: new Date('2099-01-01T00:00:00.000Z'),
    deletedAt: null,
  });
}

function makeCommand(
  overrides?: Partial<UpdateExperienceCommand>,
): UpdateExperienceCommand {
  return new UpdateExperienceCommand(
    overrides?.experienceId ?? EXPERIENCE_ID,
    overrides?.tenantId ?? TENANT_ID,
    overrides?.name ?? 'Updated transfer name',
    overrides?.description,
    overrides?.priceCop,
    overrides?.durationHours,
    overrides?.capacity,
    overrides?.coverImageUrl,
    overrides?.location,
    overrides?.availabilityType,
    overrides?.startAt,
    overrides?.endAt,
    overrides?.recurrence,
    overrides?.blackoutRanges,
    overrides?.allowStandalonePurchase,
    overrides?.allowReservationPurchase,
    overrides?.actorId ?? 'user-123',
    overrides?.actorEmail ?? 'host@example.com',
  );
}

describe('UpdateExperienceHandler', () => {
  let handler: UpdateExperienceHandler;
  let experienceRepository: jest.Mocked<ExperienceRepository>;
  let eventEmitter: ReturnType<typeof createEventEmitterMock>;

  beforeEach(() => {
    experienceRepository = createExperienceRepositoryMock();
    eventEmitter = createEventEmitterMock();
    handler = new UpdateExperienceHandler(
      experienceRepository,
      eventEmitter as any,
    );
  });

  it('throws BadRequestException when no updatable field provided', async () => {
    const command = new UpdateExperienceCommand(
      EXPERIENCE_ID,
      TENANT_ID,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'user-123',
      'host@example.com',
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when experience does not exist', async () => {
    experienceRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(makeCommand())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when tenant does not own the experience', async () => {
    experienceRepository.findById.mockResolvedValue(
      makeExperience({ tenantId: OTHER_TENANT_ID }),
    );

    await expect(handler.execute(makeCommand())).rejects.toThrow(
      ForbiddenException,
    );

    expect(experienceRepository.save).not.toHaveBeenCalled();
  });

  it('updates experience and emits audit event on valid update', async () => {
    experienceRepository.findById.mockResolvedValue(makeExperience());
    experienceRepository.save.mockResolvedValue(EXPERIENCE_ID);

    await handler.execute(makeCommand({ name: 'New transfer name' }));

    expect(experienceRepository.save).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
  });

  it('Lymon admin updates experience belonging to their tenant', async () => {
    // Admin tenantId matches experience tenantId — succeeds
    experienceRepository.findById.mockResolvedValue(makeExperience());
    experienceRepository.save.mockResolvedValue(EXPERIENCE_ID);

    await handler.execute(
      makeCommand({ tenantId: TENANT_ID, name: 'Admin updated name' }),
    );

    expect(experienceRepository.save).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
  });
});
