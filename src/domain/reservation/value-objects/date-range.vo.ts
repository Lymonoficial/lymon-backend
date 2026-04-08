import { DomainException } from '@/domain/shared/exceptions/domain.exception';

export class DateRange {
  private constructor(
    private readonly checkIn: Date,
    private readonly checkOut: Date,
  ) {}

  static create(checkIn: Date, checkOut: Date): DateRange {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDay = new Date(checkIn);
    checkInDay.setHours(0, 0, 0, 0);
    if (checkInDay < today) {
      throw new DomainException('checkIn cannot be in the past');
    }
    if (checkOut <= checkIn) {
      throw new DomainException('checkOut must be after checkIn');
    }
    return new DateRange(checkIn, checkOut);
  }

  static reconstitute(checkIn: Date, checkOut: Date): DateRange {
    return new DateRange(checkIn, checkOut);
  }

  getCheckIn(): Date {
    return this.checkIn;
  }

  getCheckOut(): Date {
    return this.checkOut;
  }

  nights(): number {
    const ms = this.checkOut.getTime() - this.checkIn.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  }

  overlaps(other: DateRange): boolean {
    return this.checkIn < other.checkOut && this.checkOut > other.checkIn;
  }
}
