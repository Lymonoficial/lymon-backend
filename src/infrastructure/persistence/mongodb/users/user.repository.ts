import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRepository } from '@/domain/users/repositories/user.repository';
import { UserDocument } from './user.schema';
import { User } from '@/domain/users/entities/user.entity';

@Injectable()
export class MongooseUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(user: User): Promise<User> {
    const createdUser = new this.userModel({
      email: user.email,
      password: user.password,
      name: user.name,
      createdAt: user.createdAt,
    });

    const saved = await createdUser.save();
    return this.mapToEntity(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .exec();
    return user ? this.mapToEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.mapToEntity(user) : null;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .exec();
    return updated ? this.mapToEntity(updated) : null;
  }

  private mapToEntity(doc: UserDocument): User {
    return new User(
      doc._id.toString(),
      doc.email,
      doc.password,
      doc.name,
      doc.createdAt,
    );
  }
}
