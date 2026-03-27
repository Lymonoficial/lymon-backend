import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestAccount } from '@/domain/guest-account/entities/guest-account.entity';
import { GuestAccountRepository } from '@/domain/guest-account/repositories/guest-account.repository';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { GuestAccountDocument } from '@/infrastructure/persistence/schemas/guest-account.schema';
import { Email } from '@/domain/shared/value-objects/email.vo';

@Injectable()
export class MongoGuestAccountRepository implements GuestAccountRepository {
  constructor(
    @InjectModel(GuestAccountDocument.name)
    private readonly model: Model<GuestAccountDocument>,
  ) {}

  async save(account: GuestAccount): Promise<string> {
    const id = account.getId()?.toString();

    const document: Partial<GuestAccountDocument & { createdAt: Date }> = {
      email: account.getEmail().toString(),
      passwordHash: account.getPasswordHash(),
      fullName: account.getFullName(),
      firstName: account.getFirstName(),
      lastName: account.getLastName(),
      status: account.getStatus(),
      emailVerified: account.isEmailVerified(),
      emailVerificationToken: account.getEmailVerificationToken(),
      emailVerificationExpiry: account.getEmailVerificationExpiry(),
      passwordResetToken: account.getPasswordResetToken(),
      passwordResetExpiry: account.getPasswordResetExpiry(),
      passwordChangedAt: account.getPasswordChangedAt(),
      updatedAt: account.getUpdatedAt(),
    };

    if (id) {
      await this.model.findByIdAndUpdate(id, document, { new: true });
      return id;
    }

    const [created] = await this.model.create([
      { ...document, createdAt: account.getCreatedAt() },
    ]);

    return created._id.toString();
  }

  async findById(id: GuestAccountId): Promise<GuestAccount | null> {
    const doc = await this.model.findById(id.toString());
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: Email): Promise<GuestAccount | null> {
    const doc = await this.model.findOne({ email: email.toString() });
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmailVerificationToken(
    hashedToken: string,
  ): Promise<GuestAccount | null> {
    const doc = await this.model.findOne({
      emailVerificationToken: hashedToken,
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findByPasswordResetToken(
    hashedToken: string,
  ): Promise<GuestAccount | null> {
    const doc = await this.model.findOne({ passwordResetToken: hashedToken });
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: GuestAccountDocument): GuestAccount {
    return GuestAccount.reconstitute({
      id: GuestAccountId.createFromString(doc._id.toString()),
      email: Email.create(doc.email),
      passwordHash: doc.passwordHash,
      fullName: doc.fullName,
      firstName: doc.firstName,
      lastName: doc.lastName,
      status: doc.status,
      emailVerified: doc.emailVerified,
      emailVerificationToken: doc.emailVerificationToken,
      emailVerificationExpiry: doc.emailVerificationExpiry,
      passwordResetToken: doc.passwordResetToken,
      passwordResetExpiry: doc.passwordResetExpiry,
      passwordChangedAt: doc.passwordChangedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
