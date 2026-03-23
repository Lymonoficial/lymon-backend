import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { CancellationPolicy } from '@/domain/property/value-objects/cancellation-policy.vo';
import { Location } from '@/domain/property/value-objects/location.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { PropertyType } from '@/domain/property/value-objects/property-type.vo';

export class Property {
  private constructor(
    private readonly id: PropertyId | null,
    private readonly tenantId: TenantId,
    private name: string,
    private description: string,
    private readonly propertyType: PropertyType,
    private address: string,
    private city: string,
    private state: string,
    private country: string,
    private zipCode: string,
    private location: Location,
    private checkInTime: string,
    private checkOutTime: string,
    private cancellationPolicy: CancellationPolicy,
    private hostPhone: string,
    private hostEmail: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {}

  static create(
    tenantId: TenantId,
    name: string,
    description: string,
    propertyType: PropertyType,
    address: string,
    city: string,
    state: string,
    country: string,
    zipCode: string,
    location: Location,
    checkInTime: string,
    checkOutTime: string,
    cancellationPolicy: CancellationPolicy,
    hostPhone: string,
    hostEmail: string,
  ): Property {
    if (!name || name.trim() === '') {
      throw new Error('Property name cannot be empty');
    }

    if (!address || address.trim() === '') {
      throw new Error('Property address cannot be empty');
    }

    return new Property(
      null,
      tenantId,
      name.trim(),
      description.trim(),
      propertyType,
      address.trim(),
      city.trim(),
      state.trim(),
      country.trim(),
      zipCode.trim(),
      location,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      hostPhone,
      hostEmail,
      new Date(),
      new Date(),
      null,
    );
  }

  static reconstitute(
    id: PropertyId,
    tenantId: TenantId,
    name: string,
    description: string,
    propertyType: PropertyType,
    address: string,
    city: string,
    state: string,
    country: string,
    zipCode: string,
    location: Location,
    checkInTime: string,
    checkOutTime: string,
    cancellationPolicy: CancellationPolicy,
    hostPhone: string,
    hostEmail: string,
    createdAt: Date,
    updatedAt: Date,
    deletedAt: Date | null,
  ): Property {
    return new Property(
      id,
      tenantId,
      name,
      description,
      propertyType,
      address,
      city,
      state,
      country,
      zipCode,
      location,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      hostPhone,
      hostEmail,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  getId(): PropertyId | null {
    return this.id;
  }

  getTenantId(): TenantId {
    return this.tenantId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getPropertyType(): PropertyType {
    return this.propertyType;
  }

  getAddress(): string {
    return this.address;
  }

  getCity(): string {
    return this.city;
  }

  getState(): string {
    return this.state;
  }

  getCountry(): string {
    return this.country;
  }

  getZipCode(): string {
    return this.zipCode;
  }

  getLocation(): Location {
    return this.location;
  }

  getCheckInTime(): string {
    return this.checkInTime;
  }

  getCheckOutTime(): string {
    return this.checkOutTime;
  }

  getCancellationPolicy(): CancellationPolicy {
    return this.cancellationPolicy;
  }

  getHostPhone(): string {
    return this.hostPhone;
  }

  getHostEmail(): string {
    return this.hostEmail;
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

  updateDetails(
    name: string,
    description: string,
    address: string,
    city: string,
    state: string,
    country: string,
    zipCode: string,
    location: Location,
  ): void {
    if (name && name.trim() !== '') {
      this.name = name.trim();
    }
    if (description !== undefined) {
      this.description = description.trim();
    }
    if (address && address.trim() !== '') {
      this.address = address.trim();
    }
    if (city && city.trim() !== '') {
      this.city = city.trim();
    }
    if (state && state.trim() !== '') {
      this.state = state.trim();
    }
    if (country && country.trim() !== '') {
      this.country = country.trim();
    }
    if (zipCode && zipCode.trim() !== '') {
      this.zipCode = zipCode.trim();
    }
    if (location) {
      this.location = location;
    }
    this.updatedAt = new Date();
  }

  updateCheckInOut(checkInTime: string, checkOutTime: string): void {
    this.checkInTime = checkInTime;
    this.checkOutTime = checkOutTime;
    this.updatedAt = new Date();
  }

  updateCancellationPolicy(policy: CancellationPolicy): void {
    this.cancellationPolicy = policy;
    this.updatedAt = new Date();
  }

  updateHostContact(phone: string, email: string): void {
    this.hostPhone = phone;
    this.hostEmail = email;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    const now = new Date();
    this.deletedAt = now;
    this.updatedAt = now;
  }
}
