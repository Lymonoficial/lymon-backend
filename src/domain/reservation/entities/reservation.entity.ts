import { ReservationId } from '../value-objects/reservation-id.vo';
import {
  ReservationStatus,
  ReservationStatusEnum,
} from '../value-objects/reservation-status.vo';
import { ReservationSource } from '../value-objects/reservation-source.vo';
import { DateRange } from '../value-objects/date-range.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { GuestId } from '@/domain/guest/value-objects/guest-id.vo';
import { DomainException } from '@/domain/shared/exceptions/domain.exception';

interface CreateReservationParams {
  tenantId: TenantId;
  propertyId: PropertyId;
  unitId: UnitId;
  guestId: GuestId;
  dateRange: DateRange;
  source: ReservationSource;
  guestsCount: number;
  pricePerNight: number;
  notes?: string | null;
  externalReservationId?: string | null;
}

export class Reservation {
  private constructor(
    private id: ReservationId | null,
    private readonly tenantId: TenantId,
    private readonly propertyId: PropertyId,
    private readonly unitId: UnitId,
    private readonly guestId: GuestId,
    private dateRange: DateRange,
    private readonly source: ReservationSource,
    private status: ReservationStatus,
    private readonly guestsCount: number,
    private readonly pricePerNight: number,
    private totalPrice: number,
    private notes: string | null,
    private readonly externalReservationId: string | null,
    private cancelledAt: Date | null,
    private cancellationReason: string | null,
    private checkInActualAt: Date | null,
    private checkOutActualAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  static create(params: CreateReservationParams): Reservation {
    const nights = params.dateRange.nights();
    const totalPrice = params.pricePerNight * nights;

    return new Reservation(
      null,
      params.tenantId,
      params.propertyId,
      params.unitId,
      params.guestId,
      params.dateRange,
      params.source,
      ReservationStatus.create(ReservationStatusEnum.PENDING),
      params.guestsCount,
      params.pricePerNight,
      totalPrice,
      params.notes ?? null,
      params.externalReservationId ?? null,
      null,
      null,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static createConfirmed(params: CreateReservationParams): Reservation {
    const reservation = Reservation.create(params);
    reservation.confirm();
    return reservation;
  }

  static reconstitute(
    id: string,
    tenantId: TenantId,
    propertyId: PropertyId,
    unitId: UnitId,
    guestId: GuestId,
    dateRange: DateRange,
    source: ReservationSource,
    status: ReservationStatus,
    guestsCount: number,
    pricePerNight: number,
    totalPrice: number,
    notes: string | null,
    externalReservationId: string | null,
    cancelledAt: Date | null,
    cancellationReason: string | null,
    checkInActualAt: Date | null,
    checkOutActualAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
  ): Reservation {
    return new Reservation(
      ReservationId.create(id),
      tenantId,
      propertyId,
      unitId,
      guestId,
      dateRange,
      source,
      status,
      guestsCount,
      pricePerNight,
      totalPrice,
      notes,
      externalReservationId,
      cancelledAt,
      cancellationReason,
      checkInActualAt,
      checkOutActualAt,
      createdAt,
      updatedAt,
    );
  }

  confirm(): void {
    this.assertCanTransitionTo(ReservationStatusEnum.CONFIRMED);
    this.status = ReservationStatus.create(ReservationStatusEnum.CONFIRMED);
    this.touch();
  }

  checkIn(actualAt?: Date): void {
    this.assertCanTransitionTo(ReservationStatusEnum.CHECKED_IN);
    this.status = ReservationStatus.create(ReservationStatusEnum.CHECKED_IN);
    this.checkInActualAt = actualAt ?? new Date();
    this.touch();
  }

  checkOut(actualAt?: Date): void {
    this.assertCanTransitionTo(ReservationStatusEnum.CHECKED_OUT);
    this.status = ReservationStatus.create(ReservationStatusEnum.CHECKED_OUT);
    this.checkOutActualAt = actualAt ?? new Date();
    this.touch();
  }

  cancel(reason?: string): void {
    this.assertCanTransitionTo(ReservationStatusEnum.CANCELLED);
    this.status = ReservationStatus.create(ReservationStatusEnum.CANCELLED);
    this.cancelledAt = new Date();
    this.cancellationReason = reason ?? null;
    this.touch();
  }

  markNoShow(): void {
    this.assertCanTransitionTo(ReservationStatusEnum.NO_SHOW);
    this.status = ReservationStatus.create(ReservationStatusEnum.NO_SHOW);
    this.touch();
  }

  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.touch();
  }

  updateDates(dateRange: DateRange): void {
    this.dateRange = dateRange;
    this.totalPrice = this.pricePerNight * dateRange.nights();
    this.touch();
  }

  getId(): ReservationId | null {
    return this.id;
  }

  setId(id: ReservationId): void {
    this.id = id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getPropertyId(): PropertyId {
    return this.propertyId;
  }

  getUnitId(): UnitId {
    return this.unitId;
  }

  getGuestId(): GuestId {
    return this.guestId;
  }

  getDateRange(): DateRange {
    return this.dateRange;
  }

  getSource(): ReservationSource {
    return this.source;
  }

  getStatus(): ReservationStatus {
    return this.status;
  }

  getGuestsCount(): number {
    return this.guestsCount;
  }

  getPricePerNight(): number {
    return this.pricePerNight;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getExternalReservationId(): string | null {
    return this.externalReservationId;
  }

  getCancelledAt(): Date | null {
    return this.cancelledAt;
  }

  getCancellationReason(): string | null {
    return this.cancellationReason;
  }

  getCheckInActualAt(): Date | null {
    return this.checkInActualAt;
  }

  getCheckOutActualAt(): Date | null {
    return this.checkOutActualAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private assertCanTransitionTo(next: ReservationStatusEnum): void {
    if (!this.status.canTransitionTo(next)) {
      throw new DomainException(
        `Cannot transition from ${this.status.toString()} to ${next}`,
      );
    }
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
