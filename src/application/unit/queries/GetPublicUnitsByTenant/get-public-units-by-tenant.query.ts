import { IQuery } from '@nestjs/cqrs';

export class GetPublicUnitsByTenantQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {}
}
