import { MongoRoleRepository } from '@/infrastructure/persistence/repositories/mongo-role.repository';
import { Role, RoleId } from '@/domain/role/entities/role.entity';
import { Permission } from '@/domain/role/value-objects/permission.vo';

describe('MongoRoleRepository', () => {
  const makeRole = () =>
    Role.reconstitute(
      RoleId.createFromString('65f1a1a2b3c4d5e6f7a8b9c9'),
      'ADMIN',
      [Permission.CRM_VIEW],
      new Date('2030-01-01T00:00:00Z'),
      new Date('2030-01-02T00:00:00Z'),
    );

  it('updates existing role when id exists', async () => {
    const roleModel: any = {
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      create: jest.fn(),
    };
    const repo = new MongoRoleRepository(roleModel);

    await repo.save(makeRole());

    expect(roleModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('creates role when id is null', async () => {
    const roleModel: any = {
      findByIdAndUpdate: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
    };
    const repo = new MongoRoleRepository(roleModel);

    const role = Role.createSystem('STAFF', [Permission.CRM_VIEW]);
    await repo.save(role);

    expect(roleModel.create).toHaveBeenCalledTimes(1);
  });

  it('finds role by id', async () => {
    const doc = {
      _id: { toString: () => '65f1a1a2b3c4d5e6f7a8b9c9' },
      name: 'ADMIN',
      permissions: [Permission.CRM_VIEW],
      createdAt: new Date('2030-01-01T00:00:00Z'),
      updatedAt: new Date('2030-01-02T00:00:00Z'),
    };

    const roleModel: any = {
      findById: jest.fn().mockResolvedValue(doc),
      find: jest.fn(),
    };
    const repo = new MongoRoleRepository(roleModel);

    const role = await repo.findById(
      RoleId.createFromString('65f1a1a2b3c4d5e6f7a8b9c9'),
    );

    expect(role?.getName()).toBe('ADMIN');
  });

  it('returns system roles list', async () => {
    const docs = [
      {
        _id: { toString: () => '65f1a1a2b3c4d5e6f7a8b9c9' },
        name: 'ADMIN',
        permissions: [Permission.CRM_VIEW],
        createdAt: new Date('2030-01-01T00:00:00Z'),
        updatedAt: new Date('2030-01-02T00:00:00Z'),
      },
    ];

    const roleModel: any = {
      findById: jest.fn(),
      find: jest.fn().mockResolvedValue(docs),
    };
    const repo = new MongoRoleRepository(roleModel);

    const roles = await repo.findSystemRoles();

    expect(roles).toHaveLength(1);
    expect(roles[0].getName()).toBe('ADMIN');
  });
});
