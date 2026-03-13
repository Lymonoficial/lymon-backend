import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  RESERVATION_REPOSITORY,
  type ReservationRepository,
} from '@/domain/reservation/repositories/reservation.repository';

@Injectable()
export class ReservationCheckInScheduler {
  private readonly logger = new Logger(ReservationCheckInScheduler.name);

  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepository: ReservationRepository,
  ) {}

  @Cron('0 23 * * *') // 11pm every day
  async autoCheckIn(): Promise<void> {
    const now = new Date();
    this.logger.log(
      `Running end-of-day auto check-in for ${now.toDateString()}`,
    );

    const reservations =
      await this.reservationRepository.findConfirmedDueForCheckIn(now);

    let succeeded = 0;
    let failed = 0;

    for (const reservation of reservations) {
      try {
        reservation.checkIn(now);
        await this.reservationRepository.save(reservation);
        succeeded++;
      } catch (err) {
        failed++;
        this.logger.warn(
          `Could not auto check-in reservation ${reservation.getId()?.toString()}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Auto check-in complete: ${succeeded} checked in, ${failed} skipped`,
    );
  }
}
