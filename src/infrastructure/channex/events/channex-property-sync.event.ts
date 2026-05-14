export const CHANNEX_PROPERTY_SYNC_EVENT = 'channex.property.sync';

export class ChannexPropertySyncEvent {
  constructor(
    public readonly propertyId: string,
    public readonly title: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly address: string,
    public readonly city: string,
    public readonly state: string,
    public readonly country: string,
    public readonly zipCode: string,
    public readonly lat: number,
    public readonly lng: number,
  ) {}
}
