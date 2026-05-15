export const CHANNEX_PROPERTY_UPDATE_EVENT = 'channex.property.update';

export class ChannexPropertyUpdateEvent {
  constructor(
    public readonly channexId: string,
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
