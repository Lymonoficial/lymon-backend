import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetPublicUnitByIdQueryHandler } from '@/application/unit/queries/GetPublicUnitById/get-public-unit-by-id.query-handler';
import { GetPublicUnitByIdQuery } from '@/application/unit/queries/GetPublicUnitById/get-public-unit-by-id.query';
import { GetPublicUnitByIdResult } from '@/application/unit/queries/GetPublicUnitById/get-public-unit-by-id.result';
import type { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import { Unit } from '@/domain/unit/entities/unit.entity';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { ExternalIds } from '@/domain/unit/value-objects/external-ids.vo';
import { createUnitRepositoryMock } from '@test/shared/mocks/repositories/unit-repository.mock';
import { UnitController } from '@/presentation/controllers/unit.controller';

const UNIT_ID = 'unit-123';
const TENANT_ID = 'tenant-456';
const PROPERTY_ID = 'property-789';

function makeUnit(overrides?: Partial<{ id: string }>): Unit {
  return Unit.reconstitute({
    id: UnitId.create(overrides?.id ?? UNIT_ID),
    tenantId: TenantId.createFromString(TENANT_ID),
    propertyId: PropertyId.create(PROPERTY_ID),
    basicInfo: {
      name: 'Unit Name',
      description: 'Unit Description',
    },
    inventoryConfig: {
      inventoryCount: 1,
    },
    capacityConfig: {
      maxGuests: 4,
      standardGuests: 2,
    },
    physicalFeatures: {
      bedrooms: [],
      bathroomsCount: 1,
      isShared: false,
    },
    pricingConfig: {
      pricePerNight: 100,
    },
    amenities: ['wifi'],
    externalIds: ExternalIds.create('ext-airbnb', 'ext-booking', 'ext-vrbo'),
    timestamps: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

describe('GetPublicUnitById', () => {
  let handler: GetPublicUnitByIdQueryHandler;
  let unitRepository: jest.Mocked<UnitRepository>;
  let controller: UnitController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    unitRepository = createUnitRepositoryMock();
    handler = new GetPublicUnitByIdQueryHandler(unitRepository);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitController],
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

    controller = module.get<UnitController>(UnitController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  describe('TC-01: Consultar una Unit válida existente en la DB', () => {
    it('Handler should return the unit as PublicUnitDto', async () => {
      const unit = makeUnit();
      unitRepository.findById.mockResolvedValue(unit);

      const query = new GetPublicUnitByIdQuery(UNIT_ID);
      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetPublicUnitByIdResult);
      expect(result.unit.id).toBe(UNIT_ID);
      expect(result.unit.name).toBe(unit.getName());
    });

    it('Handler should throw NotFoundException if unit does not exist', async () => {
      unitRepository.findById.mockResolvedValue(null);

      const query = new GetPublicUnitByIdQuery('invalid-id');
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });
  });

  describe('TC-02: Verificar exclusión de datos sensibles', () => {
    it('The resulting DTO must not contain externalIds', async () => {
      const unit = makeUnit();
      unitRepository.findById.mockResolvedValue(unit);

      const query = new GetPublicUnitByIdQuery(UNIT_ID);
      const result = await handler.execute(query);

      expect(result.unit).not.toHaveProperty('externalIds');

      expect(result.unit.name).toBe(unit.getName());
    });
  });

  describe('TC-03: Acceso sin autenticación (Endpoint público)', () => {
    it('The controller method should have the @Public() decorator', () => {
      const target = controller.getPublicById;
      const isPublic = Reflect.getMetadata('isPublic', target);
      expect(isPublic).toBe(true);
    });

    it('The controller should call the query bus without requiring user session', async () => {
      const mockResult = new GetPublicUnitByIdResult({
        id: UNIT_ID,
        name: 'Public Unit',
      } as any);
      (queryBus.execute as jest.Mock).mockResolvedValue(mockResult);

      const response = await controller.getPublicById(UNIT_ID);

      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.any(GetPublicUnitByIdQuery),
      );
      expect(response.data.unit.id).toBe(UNIT_ID);
    });
  });
});
