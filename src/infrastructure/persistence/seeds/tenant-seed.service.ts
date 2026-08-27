import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TENANT_REPOSITORY,
  type TenantRepository,
} from '@/domain/tenant/repositories/tenant.repository';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@/domain/user/repositories/user.repository';
import { Tenant } from '@/domain/tenant/entities/tenant.entity';
import { User } from '@/domain/user/entities/user.entity';
import { Email } from '@/domain/shared/value-objects/email.vo';
import { PlanType, PlanTypeEnum } from '@/domain/tenant/value-objects/plan-type.vo';
import { BcryptPasswordHasher } from '@/application/auth/services/password-hasher.service';

export const DEV_TENANT_OWNER_EMAIL = 'dev.owner@lymon.local';
export const DEV_TENANT_OWNER_PASSWORD = 'DevPassword123!';

/**
 * Seeds a demo tenant + owner user for local dev, so devs can log in
 * without going through registration/email verification. Dev only —
 * gated by isDevelopment. Safe to run on every boot — only inserts
 * when missing.
 */
@Injectable()
export class TenantSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TenantSeedService.name);
  private readonly passwordHasher = new BcryptPasswordHasher();

  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepository: TenantRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.configService.get<string>('isDevelopment') !== 'true') {
      return;
    }

    try {
      const email = Email.create(DEV_TENANT_OWNER_EMAIL);

      if (await this.tenantRepository.exists(email)) {
        this.logger.debug('Dev tenant already exists — skipping');
        return;
      }

      const plan = PlanType.create(PlanTypeEnum.LYMON_PRIME);
      const tenant = Tenant.create('Dev Tenant', email, plan);
      await this.tenantRepository.save(tenant);

      const savedTenant = await this.tenantRepository.findByOwnerEmail(email);
      if (!savedTenant) throw new Error('Failed to create dev tenant');
      savedTenant.verifyEmail();
      await this.tenantRepository.save(savedTenant);

      const passwordHash = await this.passwordHasher.hash(
        DEV_TENANT_OWNER_PASSWORD,
      );
      const user = User.createOwner(email, passwordHash, savedTenant.getId()!);
      await this.userRepository.save(user);

      const savedUser = await this.userRepository.findByEmail(email);
      if (!savedUser) throw new Error('Failed to create dev tenant owner');
      savedUser.verifyEmail();
      await this.userRepository.save(savedUser);

      this.logger.log(
        `Dev tenant seeded — login with ${DEV_TENANT_OWNER_EMAIL} / ${DEV_TENANT_OWNER_PASSWORD}`,
      );
    } catch (error) {
      this.logger.error('Failed to seed dev tenant', error);
    }
  }
}
