import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateReservationHandler } from '@/application/reservation/commands/create-reservation/create-reservation.handler';
import { CreateReservationCommand } from '@/application/reservation/commands/create-reservation/create-reservation.command';
import { CreateReservationResult } from '@/application/reservation/commands/create-reservation/create-reservation.result';
import { createReservationRepositoryMock } from '@test/shared/mocks/repositories/reservation-repository.mock';
import { createUnitRepositoryMock } from '@test/shared/mocks/repositories/unit-repository.mock';
import { createGuestRepositoryMock } from '@test/shared/mocks/repositories/guest-repository.mock';
import { ReservationSourceEnum } from '@/domain/reservation/value-objects/reservation-source.vo';
import { DateRange } from '@/domain/reservation/value-objects/date-range.vo';
import { ReservationStatusEnum } from '@/domain/reservation/value-objects/reservation-status.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { Unit } from '@/domain/unit/entities/unit.entity';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { ExternalIds } from '@/domain/unit/value-objects/external-ids.vo';
import { BedTypeEnum } from '@/domain/unit/value-objects/bed-type.vo';

describe('CreateReservationHandler', () => {
  let handler: CreateReservationHandler;
  let reservationRepository: ReturnType<typeof createReservationRepositoryMock>;
  let unitRepository: ReturnType<typeof createUnitRepositoryMock>;
  let guestRepository: ReturnType<typeof createGuestRepositoryMock>;
  let eventEmitter: { emit: jest.Mock };

  beforeEach(() => {
    reservationRepository = createReservationRepositoryMock();
    unitRepository = createUnitRepositoryMock();
    guestRepository = createGuestRepositoryMock();
    eventEmitter = { emit: jest.fn() };

    handler = new CreateReservationHandler(
      reservationRepository as any,
      unitRepository as any,
      guestRepository as any,
      eventEmitter as unknown as any,
    );
  });

  function makeUnit() {
    return Unit.create(
      TenantId.createFromString('tenant-1'),
      PropertyId.create('prop-1'),
      'Unit 1',
      'Nice unit',
      1,
      2,
      1,
      [
        {
          roomName: 'Main',
          beds: [{ type: BedTypeEnum.QUEEN, count: 1 }],
        },
      ],
      1,
      false,
      [],
      100,
      ExternalIds.create(),
    );
  }

  function makeGuest() {
    return Guest.create({
      tenantId: TenantId.createFromString('tenant-1'),
      fullName: 'John Doe',
      primaryEmail: 'john@example.com',
      identity: {},
    });
  }

  it('throws NotFoundException when unit does not exist', async () => {
    unitRepository.findById.mockResolvedValue(null);

    const cmd = new CreateReservationCommand(
      'tenant-1',
      'prop-1',
      'unit-1',
      'guest-1',
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      1,
      null,
      ReservationSourceEnum.DIRECT,
      null,
      'actor-1',
      'actor@example.com',
    );

    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
    expect(reservationRepository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when guest does not exist', async () => {
    unitRepository.findById.mockResolvedValue(makeUnit());
    guestRepository.findById.mockResolvedValue(null);

    const cmd = new CreateReservationCommand(
      'tenant-1',
      'prop-1',
      'unit-1',
      'guest-1',
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      1,
      null,
      ReservationSourceEnum.DIRECT,
      null,
      'actor-1',
      'actor@example.com',
    );

    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
    expect(reservationRepository.save).not.toHaveBeenCalled();
  });

  it('throws ConflictException when unit is not available', async () => {
    const unit = makeUnit();
    unitRepository.findById.mockResolvedValue(unit);
    guestRepository.findById.mockResolvedValue(makeGuest());

    // existing reservations that overlap and exhaust inventory - simple stub
    const a = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const b = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const existing = [
      {
        getStatus: () => ({ getValue: () => ReservationStatusEnum.CONFIRMED }),
        getDateRange: () => DateRange.create(a, b),
      } as any,
    ];

    reservationRepository.findByUnitAndDateRange.mockResolvedValue(
      existing as any,
    );

    const cmd = new CreateReservationCommand(
      'tenant-1',
      'prop-1',
      unit.getId()!.toString(),
      'guest-1',
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      1,
      null,
      ReservationSourceEnum.DIRECT,
      null,
      'actor-1',
      'actor@example.com',
    );

    await expect(handler.execute(cmd)).rejects.toThrow(ConflictException);
    expect(reservationRepository.save).not.toHaveBeenCalled();
  });

  it('creates reservation when available', async () => {
    const unit = makeUnit();
    unitRepository.findById.mockResolvedValue(unit);
    guestRepository.findById.mockResolvedValue(makeGuest());
    reservationRepository.findByUnitAndDateRange.mockResolvedValue([]);
    reservationRepository.save.mockResolvedValue('res-1');

    const cmd = new CreateReservationCommand(
      'tenant-1',
      'prop-1',
      unit.getId()!.toString(),
      'guest-1',
      new Date(Date.now() + 24 * 60 * 60 * 1000),
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      1,
      'notes',
      ReservationSourceEnum.DIRECT,
      null,
      'actor-1',
      'actor@example.com',
    );

    const result = await handler.execute(cmd);

    expect(result).toBeInstanceOf(CreateReservationResult);
    expect(result.reservationId).toBe('res-1');
    expect(reservationRepository.save).toHaveBeenCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalled();
  });
});
