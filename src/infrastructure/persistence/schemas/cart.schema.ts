import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface CartItemSubdoc {
  tenantId: Types.ObjectId;
  experienceId: Types.ObjectId;
  experienceName: string;
  selectedDate: Date | null;
  quantity: number;
  unitPriceCopSnapshot: number;
  reservationId: Types.ObjectId | null;
}

export interface CartReservationItemSubdoc {
  tenantId: Types.ObjectId;
  propertyId: Types.ObjectId;
  unitId: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  notes: string | null;
  pricePerNight: number;
  totalPriceCopSnapshot: number;
  reservationId: Types.ObjectId | null;
}

@Schema({ collection: 'carts', timestamps: true })
export class CartDocument extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'GuestAccountDocument',
    required: true,
    index: true,
  })
  guestAccountId: Types.ObjectId;

  @Prop({ required: true })
  status: string;

  @Prop({
    type: [
      {
        tenantId: { type: Types.ObjectId, required: true },
        experienceId: { type: Types.ObjectId, required: true },
        experienceName: { type: String, required: true },
        selectedDate: { type: Date, default: null },
        quantity: { type: Number, required: true },
        unitPriceCopSnapshot: { type: Number, required: true },
        reservationId: { type: Types.ObjectId, default: null },
      },
    ],
    default: [],
  })
  experienceItems: CartItemSubdoc[];

  @Prop({
    type: {
      tenantId: { type: Types.ObjectId, required: true },
      propertyId: { type: Types.ObjectId, required: true },
      unitId: { type: Types.ObjectId, required: true },
      checkIn: { type: Date, required: true },
      checkOut: { type: Date, required: true },
      guestsCount: { type: Number, required: true },
      notes: { type: String, default: null },
      pricePerNight: { type: Number, required: true },
      totalPriceCopSnapshot: { type: Number, required: true },
      reservationId: { type: Types.ObjectId, default: null },
    },
    default: null,
  })
  reservationItem: CartReservationItemSubdoc | null;
}

export const CartSchema = SchemaFactory.createForClass(CartDocument);

CartSchema.index({ guestAccountId: 1, status: 1 });
