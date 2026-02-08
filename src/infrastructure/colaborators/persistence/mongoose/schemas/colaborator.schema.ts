import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Types } from 'mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ColaboratorDocument extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) lastName: string;
  @Prop({ required: true }) email: string;
  @Prop() phone: string;
  @Prop({ enum: ['Gerente', 'Recepcionista', 'Limpieza'] }) role: string;
  // @Prop({ type: Types.ObjectId, ref: 'Hotel' }) hotelId: Types.ObjectId;
  @Prop({ default: true }) isActive: boolean;
}

export const ColaboratorSchema =
  SchemaFactory.createForClass(ColaboratorDocument);
