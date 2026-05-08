import { IQuery } from '@nestjs/cqrs';

export class GetCancellationRateQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly propertyId?: string,
  ) {}
}
