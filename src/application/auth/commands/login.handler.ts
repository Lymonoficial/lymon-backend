import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '@/application/auth/commands/login.command';
import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@/domain/user/repositories/user.repository';
import {
  type TenantRepository,
  TENANT_REPOSITORY,
} from '@/domain/tenant/repositories/tenant.repository';
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '@/application/auth/services/password-hasher.service';
import {
  type ITokenService,
  JwtPayload,
  TOKEN_SERVICE,
} from '@/application/auth/services/jwt.service';
import { Email } from '@/domain/tenant/value-objects/email.vo';

export class LoginResult {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly tenantId: string,
    public readonly role: string,
    public readonly emailVerified: boolean,
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}
  async execute(command: LoginCommand): Promise<LoginResult> {
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      command.password,
      user.getPasswordHash(),
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tenant = await this.tenantRepository.findById(user.getTenantId());
    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    const payload: JwtPayload = {
      userId: user.getId()!.toString(),
      email: user.getEmail().toString(),
      tenantId: user.getTenantId().toString(),
      activePlan: tenant.getPlan().toString(),
      role: user.getRole(),
      emailVerified: user.isEmailVerified(),
      scope: user.getScope(),
    };

    const accessToken = this.tokenService.generateAccesToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return new LoginResult(
      user.getId()!.toString(),
      user.getEmail().toString(),
      user.getTenantId().toString(),
      user.getRole(),
      user.isEmailVerified(),
      accessToken,
      refreshToken,
    );
  }
}
