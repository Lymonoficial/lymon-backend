import { CommandBus } from '@nestjs/cqrs';
import { SuppliersController } from '@/presentation/controllers/suppliers.controller';
import { Permission } from '@/domain/role/value-objects/permission.vo';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let commandBus: { execute: jest.Mock };

  const user = {
    userId: '65f1a1a2b3c4d5e6f7a8b9c1',
    email: 'admin@test.com',
    tenantId: '65f1a1a2b3c4d5e6f7a8b9c2',
    roleAssignments: [
      {
        roleId: 'r1',
        roleName: 'ADMIN',
        permissions: [Permission.PROPERTY_EDIT],
        scope: 'SYSTEM',
      },
    ],
  } as any;

  beforeEach(() => {
    commandBus = { execute: jest.fn() };
    controller = new SuppliersController(commandBus as unknown as CommandBus);
  });

  it('creates a supplier and returns supplier id', async () => {
    commandBus.execute.mockResolvedValue({ supplierId: 'supplier-123' });

    const result = await controller.createSupplier(user, {
      name: 'Fresh Supplies Inc.',
      contactEmail: 'contact@freshsupplies.com',
      contactPhone: '+12025550123',
      country: 'Colombia',
      city: 'Bogotá',
      nit: 'NIT-123456789',
    });

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      message: 'Supplier created successfully',
      data: { supplierId: 'supplier-123' },
    });
  });
});
