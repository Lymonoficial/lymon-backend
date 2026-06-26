import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  Schema as MongooseSchema,
  type Schema as MongooseSchemaType,
} from 'mongoose';

@Schema({ collection: 'counters', _id: false })
export class CounterDocument extends Document<string> {
  @Prop({ type: Number, required: true, default: 0 })
  seq: number;
}

export const CounterSchema: MongooseSchemaType<CounterDocument> =
  SchemaFactory.createForClass(CounterDocument);
CounterSchema.add({ _id: { type: MongooseSchema.Types.String } });
