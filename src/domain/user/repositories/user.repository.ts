import { Email } from '@/domain/tenant/value-objects/email.vo';
import { User, UserId } from '@/domain/user/entities/user.entity';

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
