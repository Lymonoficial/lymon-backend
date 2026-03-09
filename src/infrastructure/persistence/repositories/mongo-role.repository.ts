import { Role, RoleId } from '@/domain/role/entities/role.entity';
import { RoleRepository } from '@/domain/role/repositories/role.repository';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { RoleDocument } from '@/infrastructure/persistence/schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

export class MongoRoleRepository implements RoleRepository {
  constructor(
    @InjectModel(RoleDocument.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async save(role: Role): Promise<void> {
    const id = role.getId()?.toString();
    const document = {
      name: role.getName(),
      permissions: role.getPermissions(),
      isSystem: true,
      updatedAt: new Date(),
    };

    if (id) {
      await this.roleModel.findByIdAndUpdate(id, document, { new: true });
    } else {
      await this.roleModel.create({ ...document, createdAt: new Date() });
    }
  }

  async findById(id: RoleId): Promise<Role | null> {
    const doc = await this.roleModel.findById(id.toString());
    return doc ? this.toDomainEntity(doc) : null;
  }

  async findSystemRoles(): Promise<Role[]> {
    const docs = await this.roleModel.find({ isSystem: true });
    return docs.map((doc) => this.toDomainEntity(doc));
  }

  private toDomainEntity(doc: RoleDocument & { _id: Types.ObjectId }): Role {
    return Role.reconstitute(
      RoleId.createFromString(doc._id.toString()),
      doc.name,
      doc.permissions as Permission[],
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
