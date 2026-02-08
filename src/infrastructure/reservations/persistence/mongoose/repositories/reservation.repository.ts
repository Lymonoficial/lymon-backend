import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IReservationRepository } from '@/domain/reservations/repositories/reservation.repository';
import {
  Reservation,
  ReservationStatus,
} from '@/domain/reservations/entities/reservation.entity';
import { ReservationDocument } from '../schemas/reservation.schema';

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectModel('Reservation')
    private readonly reservationModel: Model<ReservationDocument>,
  ) { }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Reservation[]> {
    const documents = await this.reservationModel
      .find({
        $or: [
          // Reservations that start within the range
          {
            checkInDate: { $gte: startDate, $lte: endDate },
          },
          // Reservations that end within the range
          {
            checkOutDate: { $gte: startDate, $lte: endDate },
          },
          // Reservations that span the entire range
          {
            checkInDate: { $lte: startDate },
            checkOutDate: { $gte: endDate },
          },
        ],
      })
      .sort({ checkInDate: 1, roomNumber: 1 })
      .exec();

    return documents.map((doc) => this.toDomainEntity(doc));
  }

  private toDomainEntity(document: ReservationDocument): Reservation {
    return new Reservation(
      document._id.toString(),
      document.guestName,
      document.guestEmail,
      document.guestPhone,
      document.roomNumber,
      document.checkInDate,
      document.checkOutDate,
      document.status as ReservationStatus,
      document.numberOfGuests,
      (document as any).createdAt || new Date(),
    );
  }
}
