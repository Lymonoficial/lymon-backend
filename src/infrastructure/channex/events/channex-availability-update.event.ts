export const CHANNEX_AVAILABILITY_UPDATE_EVENT = 'channex.availability.update';

export class ChannexAvailabilityUpdateEvent {
  constructor(
    public readonly unitId: string,
    public readonly checkIn: Date,
    public readonly checkOut: Date,
  ) {}
}
