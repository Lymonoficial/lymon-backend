import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { ExperienceAvailabilityType } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategory } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { ExperienceScope } from '@/domain/experience/value-objects/experience-scope.vo';
import { ExperienceStatus } from '@/domain/experience/value-objects/experience-status.vo';

export interface ExperienceLocation {
  label: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface ExperienceBlackoutRange {
  startAt: Date;
  endAt: Date;
}

export interface ExperienceRecurrence {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export interface ExperienceProps {
  tenantId: TenantId;
  scope: ExperienceScope;
  propertyId?: PropertyId;
  unitIds?: UnitId[];
  name: string;
  description: string;
  category: ExperienceCategory;
  priceCop: number;
  durationHours: number;
  capacity: number;
  coverImageUrl: string;
  location: ExperienceLocation;
  availabilityType: ExperienceAvailabilityType;
  startAt?: Date;
  endAt?: Date;
  recurrence?: ExperienceRecurrence;
  blackoutRanges?: ExperienceBlackoutRange[];
  allowStandalonePurchase: boolean;
  allowReservationPurchase: boolean;
}

export interface ExperienceReconstituteData {
  id: ExperienceId;
  tenantId: TenantId;
  scope: ExperienceScope;
  propertyId?: PropertyId;
  unitIds: UnitId[];
  name: string;
  description: string;
  category: ExperienceCategory;
  priceCop: number;
  durationHours: number;
  capacity: number;
  coverImageUrl: string;
  location: ExperienceLocation;
  availabilityType: ExperienceAvailabilityType;
  startAt?: Date;
  endAt?: Date;
  recurrence?: ExperienceRecurrence;
  blackoutRanges: ExperienceBlackoutRange[];
  allowStandalonePurchase: boolean;
  allowReservationPurchase: boolean;
  minNoticeHours: number;
  purchaseCutoffHours: number;
  status: ExperienceStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export class Experience {
  private constructor(
    private readonly id: ExperienceId | null,
    private readonly tenantId: TenantId,
    private readonly scope: ExperienceScope,
    private readonly propertyId: PropertyId | null,
    private readonly unitIds: UnitId[],
    private readonly name: string,
    private readonly description: string,
    private readonly category: ExperienceCategory,
    private readonly priceCop: number,
    private readonly durationHours: number,
    private readonly capacity: number,
    private readonly coverImageUrl: string,
    private readonly location: ExperienceLocation,
    private readonly availabilityType: ExperienceAvailabilityType,
    private readonly startAt: Date | null,
    private readonly endAt: Date | null,
    private readonly recurrence: ExperienceRecurrence | null,
    private readonly blackoutRanges: ExperienceBlackoutRange[],
    private readonly allowStandalonePurchase: boolean,
    private readonly allowReservationPurchase: boolean,
    private readonly minNoticeHours: number,
    private readonly purchaseCutoffHours: number,
    private readonly status: ExperienceStatus,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly deletedAt: Date | null,
  ) {}

  static create(props: ExperienceProps): Experience {
    const now = new Date();

    const name = props.name?.trim();
    if (!name) {
      throw new Error('Experience name cannot be empty');
    }

    const description = props.description?.trim();
    if (!description) {
      throw new Error('Experience description cannot be empty');
    }

    if (description.length > 5000) {
      throw new Error('Experience description cannot exceed 5000 characters');
    }

    if (!Number.isFinite(props.priceCop) || props.priceCop <= 0) {
      throw new Error('Experience price must be greater than zero');
    }

    if (!Number.isFinite(props.durationHours) || props.durationHours <= 0) {
      throw new Error('Experience duration must be greater than zero');
    }

    if (!Number.isInteger(props.capacity) || props.capacity <= 0) {
      throw new Error('Experience capacity must be a positive integer');
    }

    if (!props.allowStandalonePurchase && !props.allowReservationPurchase) {
      throw new Error('Experience must be purchasable in at least one mode');
    }

    if (props.scope.isPropertyScope() && !props.propertyId) {
      throw new Error('Property scoped experiences require propertyId');
    }

    if (props.unitIds && props.unitIds.length > 0 && !props.propertyId) {
      throw new Error('unitIds require propertyId');
    }

    Experience.validateLocation(props.location);
    Experience.validateAvailability(
      props.availabilityType,
      props.startAt,
      props.endAt,
      props.recurrence,
      props.blackoutRanges,
      now,
    );

    return new Experience(
      null,
      props.tenantId,
      props.scope,
      props.propertyId ?? null,
      props.unitIds ?? [],
      name,
      description,
      props.category,
      props.priceCop,
      props.durationHours,
      props.capacity,
      props.coverImageUrl,
      {
        label: props.location.label.trim(),
        address: props.location.address?.trim() || undefined,
        lat: props.location.lat,
        lng: props.location.lng,
      },
      props.availabilityType,
      props.startAt ?? null,
      props.endAt ?? null,
      props.recurrence ?? null,
      props.blackoutRanges ?? [],
      props.allowStandalonePurchase,
      props.allowReservationPurchase,
      2,
      24,
      ExperienceStatus.active(),
      now,
      now,
      null,
    );
  }

  static reconstitute(data: ExperienceReconstituteData): Experience {
    return new Experience(
      data.id,
      data.tenantId,
      data.scope,
      data.propertyId ?? null,
      data.unitIds,
      data.name,
      data.description,
      data.category,
      data.priceCop,
      data.durationHours,
      data.capacity,
      data.coverImageUrl,
      data.location,
      data.availabilityType,
      data.startAt ?? null,
      data.endAt ?? null,
      data.recurrence ?? null,
      data.blackoutRanges,
      data.allowStandalonePurchase,
      data.allowReservationPurchase,
      data.minNoticeHours,
      data.purchaseCutoffHours,
      data.status,
      data.createdAt,
      data.updatedAt,
      data.deletedAt ?? null,
    );
  }

  getId(): ExperienceId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getScope(): ExperienceScope {
    return this.scope;
  }

  getPropertyId(): PropertyId | null {
    return this.propertyId;
  }

  getUnitIds(): UnitId[] {
    return this.unitIds;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getCategory(): ExperienceCategory {
    return this.category;
  }

  getPriceCop(): number {
    return this.priceCop;
  }

  getDurationHours(): number {
    return this.durationHours;
  }

  getCapacity(): number {
    return this.capacity;
  }

  getCoverImageUrl(): string {
    return this.coverImageUrl;
  }

  getLocation(): ExperienceLocation {
    return this.location;
  }

  getAvailabilityType(): ExperienceAvailabilityType {
    return this.availabilityType;
  }

  getStartAt(): Date | null {
    return this.startAt;
  }

  getEndAt(): Date | null {
    return this.endAt;
  }

  getRecurrence(): ExperienceRecurrence | null {
    return this.recurrence;
  }

  getBlackoutRanges(): ExperienceBlackoutRange[] {
    return this.blackoutRanges;
  }

  getAllowStandalonePurchase(): boolean {
    return this.allowStandalonePurchase;
  }

  getAllowReservationPurchase(): boolean {
    return this.allowReservationPurchase;
  }

  getMinNoticeHours(): number {
    return this.minNoticeHours;
  }

  getPurchaseCutoffHours(): number {
    return this.purchaseCutoffHours;
  }

  getStatus(): ExperienceStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  private static validateLocation(location: ExperienceLocation): void {
    if (!location?.label || location.label.trim() === '') {
      throw new Error('Experience location label cannot be empty');
    }

    if (
      !Number.isFinite(location.lat) ||
      location.lat < -90 ||
      location.lat > 90
    ) {
      throw new Error('Experience location latitude is invalid');
    }

    if (
      !Number.isFinite(location.lng) ||
      location.lng < -180 ||
      location.lng > 180
    ) {
      throw new Error('Experience location longitude is invalid');
    }
  }

  private static validateAvailability(
    type: ExperienceAvailabilityType,
    startAt: Date | undefined,
    endAt: Date | undefined,
    recurrence: ExperienceRecurrence | undefined,
    blackoutRanges: ExperienceBlackoutRange[] | undefined,
    now: Date,
  ): void {
    Experience.validateBlackoutRanges(blackoutRanges);

    if (type.isRecurring()) {
      Experience.validateRecurringAvailability(recurrence);
      return;
    }

    Experience.validateNonRecurringAvailability(startAt, endAt, now);
  }

  private static validateBlackoutRanges(
    blackoutRanges: ExperienceBlackoutRange[] | undefined,
  ): void {
    if (!blackoutRanges?.length) {
      return;
    }

    for (const blackout of blackoutRanges) {
      if (blackout.startAt >= blackout.endAt) {
        throw new Error('Blackout range endAt must be after startAt');
      }
    }
  }

  private static validateRecurringAvailability(
    recurrence: ExperienceRecurrence | undefined,
  ): void {
    if (!recurrence) {
      throw new Error(
        'Recurring availability requires recurrence configuration',
      );
    }

    if (!recurrence.daysOfWeek?.length) {
      throw new Error(
        'Recurring availability requires at least one day of week',
      );
    }

    if (recurrence.daysOfWeek.some((day) => day < 0 || day > 6)) {
      throw new Error('Recurring daysOfWeek must be between 0 and 6');
    }

    if (!recurrence.startTime || !recurrence.endTime) {
      throw new Error('Recurring availability requires startTime and endTime');
    }
  }

  private static validateNonRecurringAvailability(
    startAt: Date | undefined,
    endAt: Date | undefined,
    now: Date,
  ): void {
    if (!startAt || !endAt) {
      throw new Error('Non-recurring availability requires startAt and endAt');
    }

    if (!(startAt instanceof Date) || Number.isNaN(startAt.getTime())) {
      throw new TypeError('Invalid startAt date');
    }

    if (!(endAt instanceof Date) || Number.isNaN(endAt.getTime())) {
      throw new TypeError('Invalid endAt date');
    }

    if (startAt >= endAt) {
      throw new Error('Availability endAt must be after startAt');
    }

    const cutoffMs = 24 * 60 * 60 * 1000;
    if (startAt.getTime() - now.getTime() < cutoffMs) {
      throw new Error(
        'Experience start must be at least 24 hours in the future',
      );
    }
  }
}
