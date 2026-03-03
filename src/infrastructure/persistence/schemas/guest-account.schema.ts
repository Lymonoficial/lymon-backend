import { GuestAccountStatusEnum } from '@/domain/guest-account/value-objects/guest-account-status.vo';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'guest_accounts', timestamps: true })
export class GuestAccountDocument extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: String, default: null })
  firstName: string | null;

  @Prop({ type: String, default: null })
  lastName: string | null;

  @Prop({
    required: true,
    enum: Object.values(GuestAccountStatusEnum),
    default: GuestAccountStatusEnum.PENDING_VERIFICATION,
  })
  status: GuestAccountStatusEnum;

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop({ type: String, default: null })
  emailVerificationToken: string | null;

  @Prop({ type: Date, default: null })
  emailVerificationExpiry: Date | null;

  @Prop({ type: String, default: null })
  passwordResetToken: string | null;

  @Prop({ type: Date, default: null })
  passwordResetExpiry: Date | null;

  @Prop({ type: Date, default: null })
  passwordChangedAt: Date | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const GuestAccountSchema =
  SchemaFactory.createForClass(GuestAccountDocument);

GuestAccountSchema.index({ email: 1 }, { unique: true });
GuestAccountSchema.index({ emailVerificationToken: 1 }, { sparse: true });
GuestAccountSchema.index({ passwordResetToken: 1 }, { sparse: true });
