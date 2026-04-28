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
import { ConflictException } from '@nestjs/common';
import { MongoServerError } from 'mongodb';

export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: User): Promise<void> {
    try {
      const id = user.getId()?.toString();

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

      const resetPasswordToken = user.getResetPasswordToken();
      const resetPasswordExpires = user.getResetPasswordExpires();
      const passwordChangedAt = user.getPasswordChangedAt();

      // Set or unset optional fields
      if (resetPasswordToken !== undefined) {
        document.resetPasswordToken = resetPasswordToken;
      }
      if (resetPasswordExpires !== undefined) {
        document.resetPasswordExpires = resetPasswordExpires;
      }
      if (passwordChangedAt !== undefined) {
        document.passwordChangedAt = passwordChangedAt;
      }

      if (id) {
        const updateOperation: {
          $set: Partial<UserDocument>;
          $unset?: Record<string, string>;
        } = { $set: document };

        const unsetFields: Record<string, string> = {};
        if (resetPasswordToken === undefined) {
          unsetFields.resetPasswordToken = '';
        }
        if (resetPasswordExpires === undefined) {
          unsetFields.resetPasswordExpires = '';
        }

        if (Object.keys(unsetFields).length > 0) {
          updateOperation.$unset = unsetFields;
        }

        await this.userModel.findByIdAndUpdate(id, updateOperation, {
          new: true,
        });
      } else {
        await this.userModel.create({ ...document, createdAt: new Date() });
      }
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException(
          'This email is already registered. If this should be allowed across tenants, verify Mongo indexes and keep only the unique composite index { email, tenantId }.',
        );
      }

      throw error;
    }
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
    });
  }
}
