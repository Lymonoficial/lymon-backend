export const CHANNEX_ROOM_TYPE_SYNC_EVENT = 'channex.room_type.sync';

export class ChannexRoomTypeSyncEvent {
  constructor(
    public readonly unitId: string,
    public readonly propertyChannexId: string,
    public readonly title: string,
    public readonly countOfRooms: number,
    public readonly occAdults: number,
  ) {}
}
