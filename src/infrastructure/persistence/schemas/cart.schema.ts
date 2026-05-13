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
  reservationId: Types.ObjectId;
  totalPriceCopSnapshot: number;
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
    unique: true,
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
      reservationId: { type: Types.ObjectId, required: true },
      totalPriceCopSnapshot: { type: Number, required: true },
    },
    default: null,
  })
  reservationItem: CartReservationItemSubdoc | null;
}

export const CartSchema = SchemaFactory.createForClass(CartDocument);

CartSchema.index({ guestAccountId: 1, status: 1 });
