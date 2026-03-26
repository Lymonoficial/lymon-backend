import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { ExternalIds } from '@/domain/unit/value-objects/external-ids.vo';
import { Bedroom } from '@/domain/unit/value-objects/bed-type.vo';

export class Unit {
  private constructor(
    private readonly id: UnitId | null,
    private readonly tenantId: TenantId,
    private readonly propertyId: PropertyId,
    private name: string,
    private description: string,
    private inventoryCount: number,
    private maxGuests: number,
    private standardGuests: number,
    private bedrooms: Bedroom[],
    private bathroomsCount: number,
    private isShared: boolean,
    private amenities: string[],
    private pricePerNight: number,
    private externalIds: ExternalIds,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {}

  static create(
    tenantId: TenantId,
    propertyId: PropertyId,
    name: string,
    description: string,
    inventoryCount: number,
    maxGuests: number,
    standardGuests: number,
    bedrooms: Bedroom[],
    bathroomsCount: number,
    isShared: boolean,
    amenities: string[],
    pricePerNight: number,
    externalIds: ExternalIds,
  ): Unit {
    if (!name || name.trim() === '') {
      throw new Error('Unit name cannot be empty');
    }

    if (inventoryCount < 1) {
      throw new Error('Inventory count must be at least 1');
    }

    if (maxGuests < 1) {
      throw new Error('Max guests must be at least 1');
    }

    if (standardGuests < 1 || standardGuests > maxGuests) {
      throw new Error('Standard guests must be between 1 and max guests');
    }

    if (pricePerNight < 0) {
      throw new Error('Price per night cannot be negative');
    }

    return new Unit(
      null,
      tenantId,
      propertyId,
      name.trim(),
      description.trim(),
      inventoryCount,
      maxGuests,
      standardGuests,
      bedrooms,
      bathroomsCount,
      isShared,
      amenities,
      pricePerNight,
      externalIds,
      new Date(),
      new Date(),
      null,
    );
  }

  static reconstitute(
    id: UnitId,
    tenantId: TenantId,
    propertyId: PropertyId,
    name: string,
    description: string,
    inventoryCount: number,
    maxGuests: number,
    standardGuests: number,
    bedrooms: Bedroom[],
    bathroomsCount: number,
    isShared: boolean,
    amenities: string[],
    pricePerNight: number,
    externalIds: ExternalIds,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
  ): Unit {
    return new Unit(
      id,
      tenantId,
      propertyId,
      name,
      description,
      inventoryCount,
      maxGuests,
      standardGuests,
      bedrooms,
      bathroomsCount,
      isShared,
      amenities,
      pricePerNight,
      externalIds,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  getId(): UnitId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getPropertyId(): PropertyId {
    return this.propertyId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getInventoryCount(): number {
    return this.inventoryCount;
  }

  getMaxGuests(): number {
    return this.maxGuests;
  }

  getStandardGuests(): number {
    return this.standardGuests;
  }

  getBedrooms(): Bedroom[] {
    return this.bedrooms;
  }

  getBathroomsCount(): number {
    return this.bathroomsCount;
  }

  getIsShared(): boolean {
    return this.isShared;
  }

  getAmenities(): string[] {
    return this.amenities;
  }

  getPricePerNight(): number {
    return this.pricePerNight;
  }

  getExternalIds(): ExternalIds {
    return this.externalIds;
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

  updateDetails(name: string, description: string): void {
    if (name && name.trim() !== '') {
      this.name = name.trim();
    }
    if (description !== undefined) {
      this.description = description.trim();
    }
    this.updatedAt = new Date();
  }

  updateCapacity(maxGuests: number, standardGuests: number): void {
    if (maxGuests < 1) {
      throw new Error('Max guests must be at least 1');
    }
    if (standardGuests < 1 || standardGuests > maxGuests) {
      throw new Error('Standard guests must be between 1 and max guests');
    }
    this.maxGuests = maxGuests;
    this.standardGuests = standardGuests;
    this.updatedAt = new Date();
  }

  updateInventoryCount(inventoryCount: number): void {
    if (inventoryCount < 1) {
      throw new Error('Inventory count must be at least 1');
    }

    this.inventoryCount = inventoryCount;
    this.updatedAt = new Date();
  }

  updateBedrooms(bedrooms: Bedroom[]): void {
    this.bedrooms = bedrooms;
    this.updatedAt = new Date();
  }

  updateBathroomsCount(bathroomsCount: number): void {
    if (bathroomsCount < 0) {
      throw new Error('Bathrooms count cannot be negative');
    }

    this.bathroomsCount = bathroomsCount;
    this.updatedAt = new Date();
  }

  updateShared(isShared: boolean): void {
    this.isShared = isShared;
    this.updatedAt = new Date();
  }

  updatePrice(pricePerNight: number): void {
    if (pricePerNight < 0) {
      throw new Error('Price per night cannot be negative');
    }
    this.pricePerNight = pricePerNight;
    this.updatedAt = new Date();
  }

  updateAmenities(amenities: string[]): void {
    this.amenities = amenities;
    this.updatedAt = new Date();
  }

  updateExternalIds(externalIds: ExternalIds): void {
    this.externalIds = externalIds;
    this.updatedAt = new Date();
  }
}
