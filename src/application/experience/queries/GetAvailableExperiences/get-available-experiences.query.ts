import { IQuery } from '@nestjs/cqrs';

export class GetAvailableExperiencesQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly tenantId?: string,
    public readonly propertyId?: string,
    public readonly category?: string,
  ) {}
}
