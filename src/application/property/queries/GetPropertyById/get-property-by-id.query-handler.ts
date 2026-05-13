import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPropertyByIdQuery } from './get-property-by-id.query';
import {
  PropertyFullDto,
  GetPropertyByIdResult,
} from './get-property-by-id.result';
import { PROPERTY_REPOSITORY } from '@/domain/property/repositories/property.repository';
import type { PropertyRepository } from '@/domain/property/repositories/property.repository';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@QueryHandler(GetPropertyByIdQuery)
export class GetPropertyByIdQueryHandler implements IQueryHandler<
  GetPropertyByIdQuery,
  GetPropertyByIdResult
> {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async execute(query: GetPropertyByIdQuery): Promise<GetPropertyByIdResult> {
    const propertyId = PropertyId.create(query.propertyId);
    const tenantId = TenantId.createFromString(query.tenantId);

    const property = await this.propertyRepository.findById(propertyId);

    if (!property || !property.getTenantId().equals(tenantId)) {
      return new GetPropertyByIdResult(null);
    }

    const dto = new PropertyFullDto(
      property.getId()?.toString() ?? '',
      property.getName(),
      property.getDescription(),
      property.getPropertyType().toString(),
      property.getAddress(),
      property.getCity(),
      property.getState(),
      property.getCountry(),
      property.getZipCode(),
      property.getLocation().toObject(),
      property.getCheckInTime(),
      property.getCheckOutTime(),
      property.getCancellationPolicy().toString(),
      property.getHostPhone(),
      property.getHostEmail(),
      property.getCreatedAt(),
      property.getUpdatedAt(),
    );

    return new GetPropertyByIdResult(dto);
  }
}
