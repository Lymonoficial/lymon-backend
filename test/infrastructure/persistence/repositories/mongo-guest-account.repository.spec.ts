jest.mock('@/infrastructure/persistence/schemas/guest-account.schema', () => ({
  GuestAccountDocument: class GuestAccountDocument {
    static name = 'GuestAccountDocument';
  },
}));

import { MongoGuestAccountRepository } from '@/infrastructure/persistence/repositories/mongo-guest-account.repository';
import { GuestAccount } from '@/domain/guest-account/entities/guest-account.entity';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { GuestAccountStatusEnum } from '@/domain/guest-account/value-objects/guest-account-status.vo';
import { Email } from '@/domain/shared/value-objects/email.vo';

describe('MongoGuestAccountRepository', () => {
  const makeAccount = () =>
    GuestAccount.reconstitute({
      id: GuestAccountId.createFromString('guest-123'),
      email: Email.create('guest@example.com'),
      passwordHash: 'hashed-password',
      fullName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      status: GuestAccountStatusEnum.ACTIVE,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      passwordChangedAt: null,
      createdAt: new Date('2030-01-01T00:00:00Z'),
      updatedAt: new Date('2030-01-02T00:00:00Z'),
    });

  it('updates existing account and returns id', async () => {
    const model: any = {
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      create: jest.fn(),
    };
    const repo = new MongoGuestAccountRepository(model);

    const id = await repo.save(makeAccount());

    expect(model.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(id).toBe('guest-123');
  });

  it('creates new account and returns created id', async () => {
    const createdDoc = { _id: { toString: () => 'guest-new' } };
    const model: any = {
      findByIdAndUpdate: jest.fn(),
      create: jest.fn().mockResolvedValue([createdDoc]),
    };
    const repo = new MongoGuestAccountRepository(model);

    const newAccount = GuestAccount.create({
      fullName: 'Jane Doe',
      email: Email.create('jane@example.com'),
      passwordHash: 'hashed-pass',
      firstName: 'Jane',
      lastName: 'Doe',
    });

    const id = await repo.save(newAccount);

    expect(model.create).toHaveBeenCalledTimes(1);
    expect(id).toBe('guest-new');
  });

  it('finds account by email', async () => {
    const doc = {
      _id: { toString: () => 'guest-123' },
      email: 'guest@example.com',
      passwordHash: 'hashed-password',
      fullName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      status: GuestAccountStatusEnum.ACTIVE,
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      passwordChangedAt: null,
      createdAt: new Date('2030-01-01T00:00:00Z'),
      updatedAt: new Date('2030-01-02T00:00:00Z'),
    };

    const model: any = {
      findById: jest.fn(),
      findOne: jest.fn().mockResolvedValue(doc),
    };
    const repo = new MongoGuestAccountRepository(model);

    const account = await repo.findByEmail(Email.create('guest@example.com'));

    expect(account).not.toBeNull();
    expect(account?.getEmail().toString()).toBe('guest@example.com');
  });

  it('returns null when reset token is not found', async () => {
    const model: any = {
      findById: jest.fn(),
      findOne: jest.fn().mockResolvedValue(null),
    };
    const repo = new MongoGuestAccountRepository(model);

    const account = await repo.findByPasswordResetToken('missing-token');

    expect(account).toBeNull();
  });
});
