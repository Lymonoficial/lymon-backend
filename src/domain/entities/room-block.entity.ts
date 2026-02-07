export enum RoomBlockStatus {
  ACTIVE = 'active',
  RELEASED = 'released',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export class RoomBlock {
  constructor(
    public readonly id: string,
    public readonly blockName: string,
    public readonly companyName: string | null,
    public readonly eventName: string | null,
    public readonly roomNumbers: string[],
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status: RoomBlockStatus,
    public readonly createdBy: string,
    public readonly notes: string | null,
    public readonly numberOfRooms: number,
    public readonly cutoffDate: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Domain method: Check if block is currently active for a given date
   */
  public isActiveForDate(date: Date): boolean {
    return (
      this.status === RoomBlockStatus.ACTIVE &&
      date >= this.startDate &&
      date <= this.endDate
    );
  }

  /**
   * Domain method: Check if block overlaps with a date range
   */
  public overlapsWithRange(startDate: Date, endDate: Date): boolean {
    return !(this.endDate < startDate || this.startDate > endDate);
  }

  /**
   * Domain method: Check if a specific room is in this block
   */
  public includesRoom(roomNumber: string): boolean {
    return this.roomNumbers.includes(roomNumber);
  }
}
