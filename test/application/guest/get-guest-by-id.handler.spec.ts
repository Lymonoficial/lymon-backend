import 'dotenv/config';
import { GetGuestByIdHandler } from '@/application/guest/queries/get-guest-by-id/get-guest-by-id.handler';
import { GetGuestByIdQuery } from '@/application/guest/queries/get-guest-by-id/get-guest-by-id.query';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { MongoGuestRepository } from '@/infrastructure/persistence/repositories/mongo-guest.repository';
import {
  GuestDocument,
  GuestSchema,
} from '@/infrastructure/persistence/schemas/guest.schema';
import mongoose, { Connection, Model, Types } from 'mongoose';
import { GuestStatusEnum } from '@/domain/guest/entities/guest.types';

const MONGODB_URI = process.env.MONGODB_URI;
const maybeDescribe = MONGODB_URI ? describe : describe.skip;

maybeDescribe('GetGuestByIdHandler (Detailed Integration Tests)', () => {
  let connection: Connection;
  let guestModel: Model<GuestDocument>;
  let repository: MongoGuestRepository;
  let handler: GetGuestByIdHandler;

  beforeAll(async () => {
    connection = await mongoose
      .createConnection(MONGODB_URI as string, {
        dbName: 'lymon_backend_get_guest_detailed_test',
      })
      .asPromise();

    guestModel = connection.model(GuestDocument.name, GuestSchema);
    repository = new MongoGuestRepository(guestModel);
    handler = new GetGuestByIdHandler(repository);
  });

  beforeEach(async () => {
    await guestModel.deleteMany({});
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  // TC-01 & TC-03
  it('TC-01 & TC-03: Debería recuperar un huésped con email válido', async () => {
    const tenantId = TenantId.createFromString(new Types.ObjectId().toString());
    const email = 'user@example.com';
    const guest = Guest.create({
      tenantId,
      identity: { documentType: 'passport', documentNumber: 'TC01', countryCode: 'US' },
      fullName: 'John Doe',
      primaryEmail: email,
    });

    const savedId = await repository.save(guest);
    const query = new GetGuestByIdQuery(tenantId.toString(), savedId);
    const result = await handler.execute(query);

    expect(result.item).not.toBeNull();
    expect(result.item?.primaryEmail).toBe(email);
    expect(result.item?.id).toBe(savedId);
  });

  // TC-01.1
  it('TC-01.1: Debería retornar null para un ID inexistente', async () => {
    const tenantId = new Types.ObjectId().toString();
    const query = new GetGuestByIdQuery(tenantId, new Types.ObjectId().toString());
    const result = await handler.execute(query);

    expect(result.item).toBeNull();
  });

  // TC-02
  it('TC-02: Multi-tenant - Debería denegar acceso si el tenant es diferente', async () => {
    const tenantA = TenantId.createFromString(new Types.ObjectId().toString());
    const tenantB = new Types.ObjectId().toString();

    const guest = Guest.create({
      tenantId: tenantA,
      identity: { documentType: 'passport', documentNumber: 'TC02', countryCode: 'US' },
      fullName: 'Tenant A Guest',
      primaryEmail: 'guestA@hotel.com',
    });

    const savedId = await repository.save(guest);
    const query = new GetGuestByIdQuery(tenantB, savedId);
    const result = await handler.execute(query);

    expect(result.item).toBeNull();
  });

  // TC-04
  it('TC-04: Teléfono - Debería persistir y mostrar formato internacional +57300...', async () => {
    const tenantId = TenantId.createFromString(new Types.ObjectId().toString());
    const phone = '+573001234567';
    const guest = Guest.create({
      tenantId,
      identity: { documentType: 'passport', documentNumber: 'TC04', countryCode: 'CO' },
      fullName: 'Colombian Guest',
      primaryEmail: 'col@example.com',
      phones: [{ number: phone, type: 'mobile', isPrimary: true }]
    });

    const savedId = await repository.save(guest);
    const query = new GetGuestByIdQuery(tenantId.toString(), savedId);
    const result = await handler.execute(query);

    expect(result.item?.phones[0].number).toBe(phone);
  });

  // TC-05
  it('TC-05: Status - Debería validar estados Active / Blocked', async () => {
    const tenantId = TenantId.createFromString(new Types.ObjectId().toString());
    
    const guest = Guest.create({
      tenantId,
      identity: { documentType: 'passport', documentNumber: 'TC05', countryCode: 'US' },
      fullName: 'Blocked Guest',
      primaryEmail: 'blocked@example.com',
      status: GuestStatusEnum.BLOCKED,
    });

    const savedId = await repository.save(guest);
    const query = new GetGuestByIdQuery(tenantId.toString(), savedId);
    const result = await handler.execute(query);

    expect(result.item?.status).toBe(GuestStatusEnum.BLOCKED);
  });

  // TC-06
  it('TC-06: Nulidad - Debería manejar campos opcionales vacíos sin errores', async () => {
    const tenantId = TenantId.createFromString(new Types.ObjectId().toString());
    const guest = Guest.create({
      tenantId,
      identity: { documentType: 'passport', documentNumber: 'TC06', countryCode: 'US' },
      fullName: 'Minimal Guest',
      primaryEmail: 'minimal@example.com',
    });

    const savedId = await repository.save(guest);
    const query = new GetGuestByIdQuery(tenantId.toString(), savedId);
    
    const result = await handler.execute(query);

    expect(result.item).not.toBeNull();
    expect(result.item?.firstName).toBeNull();
    expect(result.item?.lastName).toBeNull();
    expect(result.item?.preferencesNotes).toBeNull();
  });
});
