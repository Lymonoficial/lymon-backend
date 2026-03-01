import { UserRoleEnum } from '@/domain/user/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocumentType = HydratedDocument<UserDocument>;

@Schema({ collection: 'users', timestamps: true })
export class UserDocument extends Document {
  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ type: Object, required: true })
  scope: { type: string; resourceIds?: string[] };
  @Prop({ required: true, enum: UserRoleEnum })
  role: string;

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });
