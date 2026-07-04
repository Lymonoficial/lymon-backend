import { Email } from '@/domain/shared/value-objects/email.vo';
import {
  RoleAssignment,
  User,
  UserId,
} from '@/domain/user/entities/user.entity';
import { UserRepository } from '@/domain/user/repositories/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '@/infrastructure/persistence/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { ConflictException, OnModuleInit } from '@nestjs/common';
import { MongoServerError } from 'mongodb';

export class MongoUserRepository implements UserRepository, OnModuleInit {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.userModel.syncIndexes();
  }

  async save(user: User): Promise<void> {
    const id = user.getId()?.toString();
    const document = this.buildDocument(user);

    try {
      if (id) {
        await this.updateUser(id, document, user);
      } else {
        await this.userModel.create({ ...document, createdAt: new Date() });
      }
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException(
          'This email is already registered for an active user in this tenant.',
        );
      }

      throw error;
    }
  }

  private buildDocument(user: User): Partial<UserDocument> {
    const document: Partial<UserDocument> = {
      email: user.getEmail().toString(),
      passwordHash: user.getPasswordHash(),
      tenantId: user.getTenantId().toString(),
      isOwner: user.isOwner(),
      roleAssignments: user.getRoleAssignments(),
      emailVerified: user.isEmailVerified(),
      updatedAt: new Date(),
      deletedAt: user.getDeletedAt(),
    };

    const optionalFields = [
      { key: 'resetPasswordToken', value: user.getResetPasswordToken() },
      { key: 'resetPasswordExpires', value: user.getResetPasswordExpires() },
      { key: 'passwordChangedAt', value: user.getPasswordChangedAt() },
      { key: 'fullName', value: user.getFullName() },
      { key: 'document', value: user.getDocument() },
      { key: 'tutorialCompleted', value: user.getTutorialCompleted() },
    ] as const;

    for (const field of optionalFields) {
      this.assignOptionalField(document, field.key, field.value);
    }

    return document;
  }

  private assignOptionalField<K extends keyof Partial<UserDocument>>(
    document: Partial<UserDocument>,
    key: K,
    value: Partial<UserDocument>[K] | undefined,
  ): void {
    if (value !== undefined) {
      document[key] = value;
    }
  }

  private async updateUser(
    id: string,
    document: Partial<UserDocument>,
    user: User,
  ): Promise<void> {
    const updateOperation: {
      $set: Partial<UserDocument>;
      $unset?: Record<string, string>;
    } = { $set: document };

    const unsetFields: Record<string, string> = {};
    if (user.getResetPasswordToken() === undefined) {
      unsetFields.resetPasswordToken = '';
    }
    if (user.getResetPasswordExpires() === undefined) {
      unsetFields.resetPasswordExpires = '';
    }

    if (Object.keys(unsetFields).length > 0) {
      updateOperation.$unset = unsetFields;
    }

    await this.userModel.findByIdAndUpdate(id, updateOperation, { new: true });
  }

  async findById(id: UserId): Promise<User | null> {
    const doc = await this.userModel.findOne({
      _id: id.toString(),
      deletedAt: null,
    });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await this.userModel.findOne({
      email: email.toString(),
      deletedAt: null,
    });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByTenantId(tenantId: TenantId): Promise<User[]> {
    const docList = await this.userModel.find({
      tenantId: tenantId.toString(),
      deletedAt: null,
    });
    return docList.map((doc) => this.toDomainEntity(doc));
  }

  async findByEmailAndTenantId(
    email: Email,
    tenantId: TenantId,
  ): Promise<User | null> {
    const doc = await this.userModel.findOne({
      email: email.toString(),
      tenantId: tenantId.toString(),
      deletedAt: null,
    });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByResetToken(hashedToken: string): Promise<User | null> {
    const doc = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      deletedAt: null,
    });
    return doc ? this.toDomainEntity(doc) : null;
  }

  private toDomainEntity(doc: UserDocument & { _id: Types.ObjectId }): User {
    return User.reconstitute({
      id: UserId.createFromString(doc._id.toString()),
      email: Email.create(doc.email),
      passwordHash: doc.passwordHash,
      tenantId: TenantId.createFromString(doc.tenantId),
      isOwnerFlag: doc.isOwner,
      roleAssignments: doc.roleAssignments as RoleAssignment[],
      emailVerified: doc.emailVerified,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      resetPasswordToken: doc.resetPasswordToken,
      resetPasswordExpires: doc.resetPasswordExpires,
      passwordChangedAt: doc.passwordChangedAt,
      deletedAt: doc.deletedAt,
      fullName: doc.fullName,
      document: doc.document,
      tutorialCompleted: doc.tutorialCompleted ?? false,
    });
  }
}
