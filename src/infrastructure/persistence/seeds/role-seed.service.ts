import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  ROLE_REPOSITORY,
  type RoleRepository,
} from '@/domain/role/repositories/role.repository';
import { Role } from '@/domain/role/entities/role.entity';
import {
  ADMIN_PERMISSIONS,
  STAFF_PERMISSIONS,
} from '@/domain/role/value-objects/permission.vo';

/**
 * Seeds the built-in system roles (ADMIN, STAFF) on application startup.
 * Safe to run on every boot — only inserts missing roles.
 */
@Injectable()
export class RoleSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedSystemRole('ADMIN', ADMIN_PERMISSIONS);
    await this.seedSystemRole('STAFF', STAFF_PERMISSIONS);
  }

  private async seedSystemRole(
    name: string,
    permissions: typeof ADMIN_PERMISSIONS,
  ): Promise<void> {
    try {
      const existing = await this.roleRepository.findSystemRoles();
      const alreadyExists = existing.some((r) => r.getName() === name);

      if (alreadyExists) {
        this.logger.debug(`System role "${name}" already exists — skipping`);
        return;
      }

      const role = Role.createSystem(name, permissions);
      await this.roleRepository.save(role);
      this.logger.log(`System role "${name}" seeded successfully`);
    } catch (error) {
      this.logger.error(`Failed to seed system role "${name}"`, error);
    }
  }
}
