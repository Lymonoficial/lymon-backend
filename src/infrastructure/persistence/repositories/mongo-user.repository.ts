import { Email } from '@/domain/tenant/value-objects/email.vo';
import {
  RoleAssignment,
  User,
  UserId,
  UserScope,
} from '@/domain/user/entities/user.entity';
import { UserRepository } from '@/domain/user/repositories/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '@/infrastructure/persistence/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async save(user: User): Promise<void> {
    const id = user.getId()?.toString();

    const document = {
      email: user.getEmail().toString(),
      passwordHash: user.getPasswordHash(),
      tenantId: user.getTenantId().toString(),
      isOwner: user.isOwner(),
      roleAssignments: user.getRoleAssignments(),
      emailVerified: user.isEmailVerified(),
      updatedAt: new Date(),
    };

    if (id) {
      await this.userModel.findByIdAndUpdate(id, document, { new: true });
    } else {
      await this.userModel.create({ ...document, createdAt: new Date() });
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const doc = await this.userModel.findById(id.toString());
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await this.userModel.findOne({ email: email.toString() });
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findByTenantId(tenantId: TenantId): Promise<User[]> {
    const docList = await this.userModel.find({
      tenantId: tenantId.toString(),
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
    });
    return doc ? this.toDomainEntity(doc) : null;
  }

  private toDomainEntity(doc: UserDocument & { _id: Types.ObjectId }): User {
    return User.reconstitute(
      UserId.createFromString(doc._id.toString()),
      Email.create(doc.email),
      doc.passwordHash,
      TenantId.createFromString(doc.tenantId),
      doc.isOwner,
      doc.roleAssignments as RoleAssignment[],
      doc.emailVerified,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
