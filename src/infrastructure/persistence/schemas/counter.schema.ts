import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'counters', _id: false })
export class CounterDocument extends Document<string> {
  @Prop({ type: Number, required: true, default: 0 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(CounterDocument);
CounterSchema.add({ _id: { type: MongooseSchema.Types.String } });
