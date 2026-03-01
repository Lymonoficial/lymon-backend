import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyEmailCommand } from '@/application/user/commands/verify-email/verify-email.command';
import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@/domain/user/repositories/user.repository';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '@/domain/tenant/repositories/tenant.repository';
import {
  type ITokenService,
  TOKEN_SERVICE,
} from '@/application/auth/services/jwt.service';
import { UserId } from '@/domain/user/entities/user.entity';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}
  async execute(command: VerifyEmailCommand): Promise<void> {
    try {
      const payload = this.tokenService.verifyToken(command.token);

      const user = await this.userRepository.findById(
        UserId.createFromString(payload.userId),
      );

      if (!user) throw new UnauthorizedException('Invalid token');

      if (user.isEmailVerified()) return;

      user.verifyEmail();
      await this.userRepository.save(user);

      const tenant = await this.tenantRepository.findById(user.getTenantId());
      if (tenant && !tenant.isEmailVerified()) {
        tenant.verifyEmail();
        await this.tenantRepository.save(tenant);
      }
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
