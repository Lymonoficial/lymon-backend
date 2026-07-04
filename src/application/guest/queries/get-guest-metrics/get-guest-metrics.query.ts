import { IQuery } from '@nestjs/cqrs';

export class GetGuestMetricsQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
    public readonly type?: string,
  ) {}
}