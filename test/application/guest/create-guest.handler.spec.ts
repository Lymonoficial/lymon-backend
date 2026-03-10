import { Guest } from '@/domain/guest/entities/guest.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { MongoGuestRepository } from '@/infrastructure/persistence/repositories/mongo-guest.repository';
import {
  GuestDocument,
  GuestSchema,
} from '@/infrastructure/persistence/schemas/guest.schema';
import mongoose, { Connection, Model, Types } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const maybeDescribe = MONGODB_URI ? describe : describe.skip;

maybeDescribe('CreateGuestHandler (integration)', () => {
  let connection: Connection;
  let guestModel: Model<GuestDocument>;
  let repository: MongoGuestRepository;

  beforeAll(async () => {
    connection = await mongoose
      .createConnection(MONGODB_URI as string, {
        dbName: 'lymon_backend_guest_repo_test',
      })
      .asPromise();

    guestModel = connection.model(GuestDocument.name, GuestSchema);
    repository = new MongoGuestRepository(guestModel);
  });

  beforeEach(async () => {
    await guestModel.deleteMany({});
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('inserts a guest and returns the generated id', async () => {
    const tenantId = TenantId.createFromString(new Types.ObjectId().toString());
    const guest = Guest.create({
      tenantId,
      identity: {
        documentType: 'passport',
        documentNumber: 'AB123456',
        countryCode: 'US',
      },
      fullName: 'John Doe',
      primaryEmail: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      emails: ['john.alt@example.com'],
      phones: [{ number: '+12025550123', type: 'mobile', isPrimary: true }],
      tags: ['vip'],
      preferencesNotes: 'Late check-in',
    });

    const createdId = await repository.save(guest);

    expect(Types.ObjectId.isValid(createdId)).toBe(true);

    const insertedDoc = await guestModel.findById(createdId).lean();

    expect(insertedDoc).toBeTruthy();
    expect(insertedDoc?.tenantId.toString()).toBe(tenantId.toString());
    expect(insertedDoc?.fullName).toBe('John Doe');
    expect(insertedDoc?.primaryEmail).toBe('john.doe@example.com');
    expect(insertedDoc?.emails).toEqual(
      expect.arrayContaining(['john.doe@example.com', 'john.alt@example.com']),
    );
  });
});
