import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUnitWithExternalIdsByIdQueryHandler } from '@/application/unit/queries/GetUnitWithExternalIdsById/get-unit-with-external-ids-by-id.query-handler';
import { GetUnitWithExternalIdsByIdQuery } from '@/application/unit/queries/GetUnitWithExternalIdsById/get-unit-with-external-ids-by-id.query';
import { GetUnitWithExternalIdsByIdResult } from '@/application/unit/queries/GetUnitWithExternalIdsById/get-unit-with-external-ids-by-id.result';
import type { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import { Unit } from '@/domain/unit/entities/unit.entity';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { ExternalIds } from '@/domain/unit/value-objects/external-ids.vo';
import { createUnitRepositoryMock } from '@test/shared/mocks/repositories/unit-repository.mock';
import { UnitController } from '@/presentation/controllers/unit.controller';

const UNIT_ID = '65f1a1a2b3c4d5e6f7a8b9c8';
const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c0';
const OTHER_TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9ff';
const PROPERTY_ID = '65f1a1a2b3c4d5e6f7a8b9c1';

function makeUnit(tenantId = TENANT_ID): Unit {
  return Unit.reconstitute({
    id: UnitId.create(UNIT_ID),
    tenantId: TenantId.createFromString(tenantId),
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

describe('GetUnitWithExternalIdsById', () => {
  let handler: GetUnitWithExternalIdsByIdQueryHandler;
  let unitRepository: jest.Mocked<UnitRepository>;
  let controller: UnitController;
  let queryBus: QueryBus;

  beforeEach(async () => {
    unitRepository = createUnitRepositoryMock();
    handler = new GetUnitWithExternalIdsByIdQueryHandler(unitRepository);

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

  describe('TC-01: Consultar una Unit válida del tenant autenticado', () => {
    it('Handler should return the unit as UnitWithExternalIdsDto including externalIds', async () => {
      const unit = makeUnit();
      unitRepository.findById.mockResolvedValue(unit);

      const query = new GetUnitWithExternalIdsByIdQuery(UNIT_ID, TENANT_ID);
      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(GetUnitWithExternalIdsByIdResult);
      expect(result.unit.id).toBe(UNIT_ID);
      expect(result.unit.name).toBe(unit.getName());
      expect(result.unit.externalIds.airbnbId).toBe('ext-airbnb');
      expect(result.unit.externalIds.bookingId).toBe('ext-booking');
      expect(result.unit.externalIds.vrboId).toBe('ext-vrbo');
    });

    it('Handler should throw NotFoundException if unit does not exist', async () => {
      unitRepository.findById.mockResolvedValue(null);

      const query = new GetUnitWithExternalIdsByIdQuery('invalid-id', TENANT_ID);
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });

    it('Handler should throw NotFoundException if unit belongs to a different tenant', async () => {
      const unit = makeUnit(OTHER_TENANT_ID);
      unitRepository.findById.mockResolvedValue(unit);

      const query = new GetUnitWithExternalIdsByIdQuery(UNIT_ID, TENANT_ID);
      await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
    });
  });

  describe('TC-02: Acceso protegido por autenticación de tenant', () => {
    it('The controller method should NOT have the @Public() decorator', () => {
      const target = controller.getByIdWithExternalIds;
      const isPublic = Reflect.getMetadata('isPublic', target);
      expect(isPublic).toBeUndefined();
    });

    it('The controller should call the query bus with tenantId from the authenticated user', async () => {
      const mockResult = new GetUnitWithExternalIdsByIdResult({
        id: UNIT_ID,
        name: 'Unit Name',
        externalIds: { airbnbId: 'ext-airbnb' },
      } as any);
      (queryBus.execute as jest.Mock).mockResolvedValue(mockResult);

      const fakeUser = { tenantId: TENANT_ID, userId: 'user-1', email: 'a@b.com' } as any;
      const response = await controller.getByIdWithExternalIds(fakeUser, UNIT_ID);

      expect(queryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          unitId: UNIT_ID,
          tenantId: TENANT_ID,
        }),
      );
      expect(response.data.unit.id).toBe(UNIT_ID);
    });
  });
});
