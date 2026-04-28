import { BedTypeEnum } from '@/domain/unit/value-objects/bed-type.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'units', timestamps: true })
export class UnitDocument extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'TenantDocument',
    required: true,
    index: true,
  })
  tenantId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'PropertyDocument',
    required: true,
  })
  propertyId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: 1, min: 1 })
  inventoryCount: number;

  @Prop({ required: true, min: 1 })
  maxGuests: number;

  @Prop({ required: true, min: 1 })
  standardGuests: number;

  @Prop({
    type: [
      {
        roomName: { type: String, required: true },
        beds: [
          {
            type: { type: String, enum: BedTypeEnum, required: true },
            count: { type: Number, required: true, min: 1 },
          },
        ],
      },
    ],
    required: true,
  })
  bedrooms: Array<{
    roomName: string;
    beds: Array<{
      type: BedTypeEnum;
      count: number;
    }>;
  }>;

  @Prop({ required: true, min: 0 })
  bathroomsCount: number;

  @Prop({ required: true, default: false })
  isShared: boolean;

  @Prop({ type: [String], required: true, default: [] })
  amenities: string[];

  @Prop({ required: true, min: 0 })
  pricePerNight: number;

  @Prop({
    type: {
      airbnbId: { type: String },
      bookingId: { type: String },
      vrboId: { type: String },
    },
    required: false,
  })
  externalIds: {
    airbnbId?: string;
    bookingId?: string;
    vrboId?: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const UnitSchema = SchemaFactory.createForClass(UnitDocument);

// Índices para optimizar consultas
UnitSchema.index({ tenantId: 1, deletedAt: 1, createdAt: -1 });
UnitSchema.index({ propertyId: 1, deletedAt: 1 });
UnitSchema.index({ 'externalIds.airbnbId': 1 }, { sparse: true });
UnitSchema.index({ 'externalIds.bookingId': 1 }, { sparse: true });
UnitSchema.index({ 'externalIds.vrboId': 1 }, { sparse: true });
