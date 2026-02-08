import { Schema, Document as MongooseDocument } from 'mongoose';

export const EmailTemplateSchema = new Schema({
  hotelId: { type: String, required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['welcome', 'arrival_instructions', 'satisfaction_survey'],
    index: true,
  },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Índice compuesto para búsquedas por hotel y tipo
EmailTemplateSchema.index({ hotelId: 1, type: 1 });

export interface EmailTemplateDocument extends MongooseDocument {
  hotelId: string;
  type: string;
  subject: string;
  body: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
