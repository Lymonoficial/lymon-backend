import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import {
  ExperienceAvailabilityType,
  ExperienceAvailabilityTypeEnum,
} from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategory } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { ExperienceStatus } from '@/domain/experience/value-objects/experience-status.vo';
import { DomainException } from '@/domain/shared/exceptions/domain.exception';

export interface ExperienceLocation {
  label?: string;
  address?: string;
  lat?: number;
  lng?: number;
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
  propertyId?: PropertyId;
  unitIds?: UnitId[];
  name: string;
  description: string;
  city: string;
  category: ExperienceCategory;
  priceCop: number;
  durationHours?: number | null;
  minimumParticipants?: number;
  capacity: number;
  location?: ExperienceLocation | null;
  availabilityType: ExperienceAvailabilityType;
  startAt?: Date;
  endAt?: Date;
  recurrence?: ExperienceRecurrence;
  blackoutRanges?: ExperienceBlackoutRange[];
  allowStandalonePurchase: boolean;
  allowReservationPurchase: boolean;
  mediaKeys?: string[];
}

export interface ExperienceReconstituteData {
  id: ExperienceId;
  tenantId: TenantId;
  mediaKeys?: string[];
  propertyId?: PropertyId;
  unitIds: UnitId[];
  name: string;
  description: string;
  city: string;
  category: ExperienceCategory;
  priceCop: number;
  durationHours?: number | null;
  minimumParticipants?: number;
  capacity: number;
  location?: ExperienceLocation | null;
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

export interface ExperienceChanges {
  name?: string;
  description?: string;
  city?: string;
  priceCop?: number;
  durationHours?: number | null;
  minimumParticipants?: number;
  capacity?: number;
  location?: ExperienceLocation | null;
  availabilityType?: ExperienceAvailabilityTypeEnum;
  startAt?: Date;
  endAt?: Date;
  recurrence?: ExperienceRecurrence;
  blackoutRanges?: ExperienceBlackoutRange[];
  allowStandalonePurchase?: boolean;
  allowReservationPurchase?: boolean;
  mediaKeys?: string[];
}

export class Experience {
  private constructor(
    private readonly id: ExperienceId | null,
    private readonly tenantId: TenantId,
    private readonly propertyId: PropertyId | null,
    private readonly unitIds: UnitId[],
    private name: string,
    private description: string,
    private city: string,
    private readonly category: ExperienceCategory,
    private priceCop: number,
    private durationHours: number | null,
    private minimumParticipants: number,
    private capacity: number,
    private location: ExperienceLocation | null,
    private availabilityType: ExperienceAvailabilityType,
    private startAt: Date | null,
    private endAt: Date | null,
    private recurrence: ExperienceRecurrence | null,
    private blackoutRanges: ExperienceBlackoutRange[],
    private allowStandalonePurchase: boolean,
    private allowReservationPurchase: boolean,
    private readonly minNoticeHours: number,
    private readonly purchaseCutoffHours: number,
    private readonly status: ExperienceStatus,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private mediaKeys: string[],
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

    const city = props.city?.trim();
    if (!city) {
      throw new Error('Experience city cannot be empty');
    }

    if (!Number.isFinite(props.priceCop) || props.priceCop <= 0) {
      throw new Error('Experience price must be greater than zero');
    }

    Experience.validateDurationHours(props.durationHours);

    const minimumParticipants = props.minimumParticipants ?? 1;
    Experience.validateParticipantLimits(minimumParticipants, props.capacity);

    if (!props.allowStandalonePurchase && !props.allowReservationPurchase) {
      throw new Error('Experience must be purchasable in at least one mode');
    }

    if (props.unitIds && props.unitIds.length > 0 && !props.propertyId) {
      throw new Error('unitIds require propertyId');
    }

    const location = Experience.normalizeLocation(props.location);
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
      props.propertyId ?? null,
      props.unitIds ?? [],
      name,
      description,
      city,
      props.category,
      props.priceCop,
      props.durationHours ?? null,
      minimumParticipants,
      props.capacity,
      location,
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
      props.mediaKeys ?? [],
    );
  }

  static reconstitute(data: ExperienceReconstituteData): Experience {
    return new Experience(
      data.id,
      data.tenantId,
      data.propertyId ?? null,
      data.unitIds,
      data.name,
      data.description,
      data.city,
      data.category,
      data.priceCop,
      data.durationHours ?? null,
      data.minimumParticipants ?? 1,
      data.capacity,
      data.location ?? null,
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
      data.mediaKeys ?? [],
    );
  }

  getId(): ExperienceId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
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

  getCity(): string {
    return this.city;
  }

  getCategory(): ExperienceCategory {
    return this.category;
  }

  getPriceCop(): number {
    return this.priceCop;
  }

  getDurationHours(): number | null {
    return this.durationHours;
  }

  getMinimumParticipants(): number {
    return this.minimumParticipants;
  }

  getCapacity(): number {
    return this.capacity;
  }
  getLocation(): ExperienceLocation | null {
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

  getMediaKeys(): string[] {
    return this.mediaKeys;
  }

  update(changes: ExperienceChanges): void {
    const name = (changes.name ?? this.name)?.trim();
    if (!name) {
      throw new Error('Experience name cannot be empty');
    }

    const description = (changes.description ?? this.description)?.trim();
    if (!description) {
      throw new Error('Experience description cannot be empty');
    }

    if (description.length > 5000) {
      throw new Error('Experience description cannot exceed 5000 characters');
    }

    const city = (changes.city ?? this.city)?.trim();
    if (!city) {
      throw new Error('Experience city cannot be empty');
    }

    const priceCop = changes.priceCop ?? this.priceCop;
    if (!Number.isFinite(priceCop) || priceCop <= 0) {
      throw new Error('Experience price must be greater than zero');
    }

    const durationHours =
      changes.durationHours === undefined
        ? this.durationHours
        : changes.durationHours;
    Experience.validateDurationHours(durationHours);

    const minimumParticipants =
      changes.minimumParticipants ?? this.minimumParticipants;
    const capacity = changes.capacity ?? this.capacity;
    Experience.validateParticipantLimits(minimumParticipants, capacity);

    const allowStandalonePurchase =
      changes.allowStandalonePurchase ?? this.allowStandalonePurchase;
    const allowReservationPurchase =
      changes.allowReservationPurchase ?? this.allowReservationPurchase;
    if (!allowStandalonePurchase && !allowReservationPurchase) {
      throw new Error('Experience must be purchasable in at least one mode');
    }

    const location =
      changes.location === undefined
        ? this.location
        : Experience.mergeLocation(this.location, changes.location);

    const availabilityType = changes.availabilityType
      ? ExperienceAvailabilityType.create(changes.availabilityType)
      : this.availabilityType;
    const startAt = changes.startAt ?? this.startAt ?? undefined;
    const endAt = changes.endAt ?? this.endAt ?? undefined;
    const recurrence = changes.recurrence ?? this.recurrence ?? undefined;
    const blackoutRanges = changes.blackoutRanges ?? this.blackoutRanges;

    Experience.validateAvailability(
      availabilityType,
      startAt,
      endAt,
      recurrence,
      blackoutRanges,
      new Date(),
    );

    this.name = name;
    this.description = description;
    this.city = city;
    this.priceCop = priceCop;
    this.durationHours = durationHours;
    this.minimumParticipants = minimumParticipants;
    this.capacity = capacity;
    this.location = location;
    this.availabilityType = availabilityType;
    this.startAt = startAt ?? null;
    this.endAt = endAt ?? null;
    this.recurrence = recurrence ?? null;
    this.blackoutRanges = blackoutRanges;
    this.allowStandalonePurchase = allowStandalonePurchase;
    this.allowReservationPurchase = allowReservationPurchase;
    if (changes.mediaKeys !== undefined) {
      this.mediaKeys = changes.mediaKeys;
    }
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  validateParticipantQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainException('Participants must be a positive integer');
    }

    if (quantity < this.minimumParticipants) {
      throw new DomainException(
        `This experience requires at least ${this.minimumParticipants} participant${this.minimumParticipants === 1 ? '' : 's'}`,
      );
    }

    if (quantity > this.capacity) {
      throw new DomainException(
        `This experience allows up to ${this.capacity} participant${this.capacity === 1 ? '' : 's'}`,
      );
    }
  }

  private static validateParticipantLimits(
    minimumParticipants: number,
    capacity: number,
  ): void {
    if (!Number.isInteger(minimumParticipants) || minimumParticipants <= 0) {
      throw new Error(
        'Experience minimum participants must be a positive integer',
      );
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('Experience capacity must be a positive integer');
    }

    if (minimumParticipants > capacity) {
      throw new Error('Experience minimum participants cannot exceed capacity');
    }
  }

  private static validateDurationHours(
    durationHours: number | null | undefined,
  ): void {
    if (durationHours === null || durationHours === undefined) {
      return;
    }

    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      throw new Error('Experience duration must be greater than zero');
    }
  }

  private static normalizeLocation(
    location: ExperienceLocation | null | undefined,
  ): ExperienceLocation | null {
    if (!location) {
      return null;
    }

    Experience.validateLocation(location);

    return {
      label: location.label?.trim() || undefined,
      address: location.address?.trim() || undefined,
      lat: location.lat,
      lng: location.lng,
    };
  }

  private static mergeLocation(
    current: ExperienceLocation | null,
    changes: ExperienceLocation | null,
  ): ExperienceLocation | null {
    if (changes === null) {
      return null;
    }

    return Experience.normalizeLocation({
      ...(current ?? {}),
      ...changes,
    });
  }

  private static validateLocation(location: ExperienceLocation): void {
    if (
      location.lat !== undefined &&
      (!Number.isFinite(location.lat) ||
        location.lat < -90 ||
        location.lat > 90)
    ) {
      throw new Error('Experience location latitude is invalid');
    }

    if (
      location.lng !== undefined &&
      (!Number.isFinite(location.lng) ||
        location.lng < -180 ||
        location.lng > 180)
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
