import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUnitHandler } from '@/application/unit/commands/update-unit.handler';
import { UpdateUnitCommand } from '@/application/unit/commands/update-unit.command';
import { UpdateUnitResult } from '@/application/unit/commands/update-unit.result';
import { Unit } from '@/domain/unit/entities/unit.entity';
import { UnitRepository } from '@/domain/unit/repositories/unit.repository';
import { ReservationRepository } from '@/domain/reservation/repositories/reservation.repository';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ExternalIds } from '@/domain/unit/value-objects/external-ids.vo';
import { BedTypeEnum } from '@/domain/unit/value-objects/bed-type.vo';
import { createUnitRepositoryMock } from '@test/shared/mocks/repositories/unit-repository.mock';
import { createReservationRepositoryMock } from '@test/shared/mocks/repositories/reservation-repository.mock';
import { createEventEmitterMock } from '@test/shared/mocks/services/event-emitter.mock';
import { makeReservation } from '@test/shared/fixtures/reservation.fixture';

const UNIT_ID = '65f1a1a2b3c4d5e6f7a8b9c4';
const TENANT_ID = '65f1a1a2b3c4d5e6f7a8b9c2';
const PROPERTY_ID = '65f1a1a2b3c4d5e6f7a8b9c3';

function makeUnit(
  overrides?: Partial<{ tenantId: string; inventoryCount: number }>,
): Unit {
  return Unit.reconstitute({
    id: UnitId.create(UNIT_ID),
    tenantId: TenantId.createFromString(overrides?.tenantId ?? TENANT_ID),
    propertyId: PropertyId.create(PROPERTY_ID),
    basicInfo: {
      name: 'Deluxe Suite',
      description: 'Ocean view suite',
    },
    inventoryConfig: {
      inventoryCount: overrides?.inventoryCount ?? 3,
    },
    capacityConfig: {
      maxGuests: 4,
      standardGuests: 2,
    },
    physicalFeatures: {
      bedrooms: [
        { roomName: 'Master', beds: [{ type: BedTypeEnum.QUEEN, count: 1 }] },
      ],
      bathroomsCount: 1,
      isShared: false,
    },
    pricingConfig: {
      pricePerNight: 200,
    },
    amenities: ['wifi'],
    externalIds: ExternalIds.create('airbnb-1', undefined, undefined),
    timestamps: {
      createdAt: new Date('2030-01-01T00:00:00.000Z'),
      updatedAt: new Date('2030-01-01T00:00:00.000Z'),
    },
  });
}

function makeCommand(
  overrides?: Partial<{
    tenantId: string;
    unitId: string;
    name: string | undefined;
    inventoryCount: number | undefined;
    maxGuests: number | undefined;
    standardGuests: number | undefined;
  }>,
): UpdateUnitCommand {
  return new UpdateUnitCommand(
    overrides?.tenantId ?? TENANT_ID,
    overrides?.unitId ?? UNIT_ID,
    overrides?.name,
    undefined,
    overrides?.inventoryCount,
    overrides?.maxGuests,
    overrides?.standardGuests,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'user-1',
    'owner@example.com',
  );
}

describe('UpdateUnitHandler', () => {
  let handler: UpdateUnitHandler;
  let unitRepository: jest.Mocked<UnitRepository>;
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let eventEmitter: ReturnType<typeof createEventEmitterMock>;

  beforeEach(() => {
    unitRepository = createUnitRepositoryMock();
    reservationRepository = createReservationRepositoryMock();
    eventEmitter = createEventEmitterMock();

    handler = new UpdateUnitHandler(
      unitRepository,
      reservationRepository,
      eventEmitter as any,
    );
  });

  it('throws BadRequestException when no field is provided', async () => {
    unitRepository.findById.mockResolvedValue(makeUnit());

    await expect(
      handler.execute(
        new UpdateUnitCommand(
          TENANT_ID,
          UNIT_ID,
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
          'user-1',
          'owner@example.com',
        ),
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when unit does not exist', async () => {
    unitRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(makeCommand({ name: 'Updated Name' })),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when unit belongs to a different tenant', async () => {
    unitRepository.findById.mockResolvedValue(
      makeUnit({ tenantId: 'other-tenant-id' }),
    );

    await expect(
      handler.execute(makeCommand({ name: 'Updated Name' })),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ConflictException when reducing inventory below active overlap peak', async () => {
    unitRepository.findById.mockResolvedValue(makeUnit({ inventoryCount: 3 }));
    reservationRepository.findActiveByUnitFromDate.mockResolvedValue([
      makeReservation({
        unitId: UNIT_ID,
        tenantId: TENANT_ID,
        propertyId: PROPERTY_ID,
        checkIn: new Date('2030-01-01T14:00:00Z'),
        checkOut: new Date('2030-01-05T10:00:00Z'),
      }),
      makeReservation({
        id: '65f1a1a2b3c4d5e6f7a8b9d9',
        unitId: UNIT_ID,
        tenantId: TENANT_ID,
        propertyId: PROPERTY_ID,
        checkIn: new Date('2030-01-03T14:00:00Z'),
        checkOut: new Date('2030-01-07T10:00:00Z'),
      }),
    ]);

    await expect(
      handler.execute(makeCommand({ inventoryCount: 1 })),
    ).rejects.toThrow(ConflictException);
  });

  it('updates unit, persists changes, and emits audit event', async () => {
    unitRepository.findById.mockResolvedValue(makeUnit({ inventoryCount: 3 }));
    reservationRepository.findActiveByUnitFromDate.mockResolvedValue([
      makeReservation({
        unitId: UNIT_ID,
        tenantId: TENANT_ID,
        propertyId: PROPERTY_ID,
        checkIn: new Date('2030-01-01T14:00:00Z'),
        checkOut: new Date('2030-01-02T10:00:00Z'),
      }),
    ]);
    unitRepository.save.mockResolvedValue(UNIT_ID);

    const result = await handler.execute(
      makeCommand({
        name: 'Renamed Suite',
        inventoryCount: 2,
        maxGuests: 5,
        standardGuests: 3,
      }),
    );

    expect(result).toBeInstanceOf(UpdateUnitResult);
    expect(result.unitId).toBe(UNIT_ID);
    expect(unitRepository.save).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ entityType: 'UNIT' }),
    );
  });
});
