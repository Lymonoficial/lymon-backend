import { Reservation } from '@/domain/reservation/entities/reservation.entity';
import {
  ReservationStatus,
  ReservationStatusEnum,
} from '@/domain/reservation/value-objects/reservation-status.vo';
import {
  ReservationSource,
  ReservationSourceEnum,
} from '@/domain/reservation/value-objects/reservation-source.vo';
import { DateRange } from '@/domain/reservation/value-objects/date-range.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';

export const RESERVATION_FIXTURE_DEFAULTS = {
  id: '65f1a1a2b3c4d5e6f7a8b9c1',
  tenantId: '65f1a1a2b3c4d5e6f7a8b9c2',
  propertyId: '65f1a1a2b3c4d5e6f7a8b9c3',
  unitId: '65f1a1a2b3c4d5e6f7a8b9c4',
  guestId: '65f1a1a2b3c4d5e6f7a8b9c5',
  checkIn: new Date('2030-01-01T14:00:00Z'),
  checkOut: new Date('2030-01-05T10:00:00Z'),
  source: ReservationSourceEnum.DIRECT,
  status: ReservationStatusEnum.CONFIRMED,
  guestsCount: 2,
  pricePerNight: 100,
  totalPrice: 400,
  createdAt: new Date('2030-01-01T10:00:00Z'),
  updatedAt: new Date('2030-01-01T10:00:00Z'),
};

export function makeReservation(
  overrides?: Partial<{
    id: string;
    tenantId: string;
    propertyId: string;
    unitId: string;
    guestId: string;
    checkIn: Date;
    checkOut: Date;
    source: ReservationSourceEnum;
    status: ReservationStatusEnum;
    guestsCount: number;
    pricePerNight: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
  }>,
): Reservation {
  const merged = { ...RESERVATION_FIXTURE_DEFAULTS, ...overrides };

  return Reservation.reconstitute(
    merged.id,
    TenantId.createFromString(merged.tenantId),
    PropertyId.create(merged.propertyId),
    UnitId.create(merged.unitId),
    GuestId.createFromString(merged.guestId),
    DateRange.create(merged.checkIn, merged.checkOut),
    ReservationSource.create(merged.source),
    ReservationStatus.create(merged.status),
    merged.guestsCount,
    merged.pricePerNight,
    merged.totalPrice,
    null,
    null,
    null,
    null,
    null,
    null,
    merged.createdAt,
    merged.updatedAt,
  );
}
