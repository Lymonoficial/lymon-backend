import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Experience } from '@/domain/experience/entities/experience.entity';
import type { ExperienceRepository } from '@/domain/experience/repositories/experience.repository';
import { ExperienceAvailabilityType } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategory } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { ExperienceScope } from '@/domain/experience/value-objects/experience-scope.vo';
import { ExperienceStatus } from '@/domain/experience/value-objects/experience-status.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { createExperienceRepositoryMock } from '@test/shared/mocks/repositories/experience-repository.mock';
import { ExperienceController } from '@/presentation/controllers/experience.controller';
import { GetExperiencesByTenantQuery } from '@/application/experience/queries/GetExperiencesByTenant/get-experiences-by-tenant.query';
import { GetExperiencesByTenantQueryHandler } from '@/application/experience/queries/GetExperiencesByTenant/get-experiences-by-tenant.query-handler';
import { GetExperiencesByTenantResult } from '@/application/experience/queries/GetExperiencesByTenant/get-experiences-by-tenant.result';

const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c0';
const EXPERIENCE_ID = 'experience-123';

function makeExperience(overrides?: Partial<{ id: string }>) {
  return Experience.reconstitute({
    id: ExperienceId.create(overrides?.id ?? EXPERIENCE_ID),
    tenantId: TenantId.createFromString(TENANT_ID),
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
      address: 'Cra 10 #20-30, Bogota',
      lat: 4.6097,
      lng: -74.0817,
    },
    availabilityType: ExperienceAvailabilityType.create('DATE_RANGE'),
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

describe('GetExperiencesByTenant', () => {
  let handler: GetExperiencesByTenantQueryHandler;
  let experienceRepository: jest.Mocked<ExperienceRepository>;
  let controller: ExperienceController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    experienceRepository = createExperienceRepositoryMock();

    handler = new GetExperiencesByTenantQueryHandler(experienceRepository);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperienceController],
      providers: [
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ExperienceController>(ExperienceController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('handler returns paginated tenant experiences mapped as DTOs', async () => {
    experienceRepository.findByTenantIdPaginated.mockResolvedValue({
      experiences: [makeExperience()],
      total: 1,
    });

    const result = await handler.execute(
      new GetExperiencesByTenantQuery(TENANT_ID, 1, 10),
    );

    expect(result).toBeInstanceOf(GetExperiencesByTenantResult);
    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].id).toBe(EXPERIENCE_ID);
  });

  it('controller executes query bus with current tenant', async () => {
    const mockResult = new GetExperiencesByTenantResult(
      [
        {
          id: EXPERIENCE_ID,
          name: 'Airport transfer',
        } as any,
      ],
      1,
      1,
      10,
    );

    (queryBus.execute as jest.Mock).mockResolvedValue(mockResult);

    const response = await controller.getAll(
      {
        tenantId: TENANT_ID,
      } as any,
      undefined,
      1,
      10,
    );

    expect(queryBus.execute).toHaveBeenCalledWith(
      expect.any(GetExperiencesByTenantQuery),
    );
    expect(response.data.experiences[0].id).toBe(EXPERIENCE_ID);
  });
});
