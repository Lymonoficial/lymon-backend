import { IQuery } from '@nestjs/cqrs';

export class GetInventoryItemsByPropertyQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly propertyId: string,
  ) {}
}
