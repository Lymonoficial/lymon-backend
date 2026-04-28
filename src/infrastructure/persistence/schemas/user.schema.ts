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

  @Prop({ required: true, default: false })
  isOwner: boolean;

  @Prop({ type: [Object], required: true, default: [] })
  roleAssignments: {
    roleId: string;
    scope: { type: string; resourceIds?: string[] };
  }[];

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  passwordChangedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

UserSchema.index({ email: 1, tenantId: 1, deletedAt: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, deletedAt: 1 });
