import { ForbiddenException } from '@nestjs/common';
import { GetShiftsHandler } from '@/application/shift/queries/get-shifts/get-shifts.handler';
import { GetShiftsQuery } from '@/application/shift/queries/get-shifts/get-shifts.query';
import { ShiftRepository } from '@/domain/shift/repositories/shift.repository';
import { PropertyRepository } from '@/domain/property/repositories/property.repository';
import { UnitRepository } from '@/domain/unit/repositories/unit.repository';

describe('GetShiftsHandler', () => {
  const tenantId = '65f1a1a2b3c4d5e6f7a8b9c0';
  const actorUserId = '65f1a1a2b3c4d5e6f7a8b9c1';
  const otherUserId = '65f1a1a2b3c4d5e6f7a8b9c2';

  let shiftRepository: jest.Mocked<ShiftRepository>;
  let propertyRepository: jest.Mocked<PropertyRepository>;
  let unitRepository: jest.Mocked<UnitRepository>;
  let handler: GetShiftsHandler;

  beforeEach(() => {
    shiftRepository = {
      save: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findByFilters: jest.fn(),
      findOverlappingByStaffInRange: jest.fn(),
      findOverlappingByStaff: jest.fn(),
    };

    propertyRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTenantId: jest.fn().mockResolvedValue([]),
      countByTenantId: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PropertyRepository>;

    unitRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByPropertyId: jest.fn(),
      findByTenantId: jest.fn().mockResolvedValue([]),
      countByTenantId: jest.fn(),
      delete: jest.fn(),
      findByTenantIdPaginated: jest.fn(),
      findAllPaginated: jest.fn(),
    } as unknown as jest.Mocked<UnitRepository>;

    shiftRepository.findByFilters.mockResolvedValue([]);
    handler = new GetShiftsHandler(
      shiftRepository,
      propertyRepository,
      unitRepository,
    );
  });

  it('throws when staff user asks shifts for another user', async () => {
    const query = new GetShiftsQuery(
      tenantId,
      {},
      actorUserId,
      false,
      otherUserId,
    );

    await expect(handler.execute(query)).rejects.toThrow(ForbiddenException);
    expect(shiftRepository.findByFilters).not.toHaveBeenCalled();
  });

  it('filters by requested staff member when manager asks by id', async () => {
    const query = new GetShiftsQuery(tenantId, {}, actorUserId, true, otherUserId);

    await handler.execute(query);

    const [, , visibleStaffMemberId] = shiftRepository.findByFilters.mock.calls[0];
    expect(visibleStaffMemberId?.toString()).toBe(otherUserId);
  });

  it('keeps existing behavior for staff without explicit staffMemberId', async () => {
    const query = new GetShiftsQuery(tenantId, {}, actorUserId, false);

    await handler.execute(query);

    const [, , visibleStaffMemberId] = shiftRepository.findByFilters.mock.calls[0];
    expect(visibleStaffMemberId?.toString()).toBe(actorUserId);
  });
});
