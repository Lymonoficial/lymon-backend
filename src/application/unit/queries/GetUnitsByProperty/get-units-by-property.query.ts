import { IQuery } from '@nestjs/cqrs';

export class GetUnitsByPropertyQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly propertyId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
