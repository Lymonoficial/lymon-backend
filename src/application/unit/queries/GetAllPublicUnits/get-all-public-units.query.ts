import { IQuery } from '@nestjs/cqrs';

export class GetAllPublicUnitsQuery implements IQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly minGuests?: number,
  ) {}
}
