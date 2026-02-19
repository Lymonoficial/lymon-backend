import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '@/application/user/commands/change-password.command';
import {
  BadRequestException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/domain/user/repositories/user.repository';
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '@/application/auth/services/password-hasher.service';
import { UserId } from '@/domain/user/entities/user.entity';

export class ChangePasswordResult {
  constructor(public readonly message: string) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}
  async execute(command: ChangePasswordCommand): Promise<ChangePasswordResult> {
    const user = await this.userRepository.findById(
      UserId.createFromString(command.userId),
    );

    console.log('User found:', user);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      command.currentPassword,
      user.getPasswordHash(),
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is invalid');
    }
    const isSamePassword = await this.passwordHasher.compare(
      command.newPassword,
      user.getPasswordHash(),
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );
    }

    const newPasswordHash = await this.passwordHasher.hash(command.newPassword);
    user.changePassword(newPasswordHash);
    await this.userRepository.save(user);

    return new ChangePasswordResult('Password changed successfully');
  }
}
