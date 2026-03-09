import { SetMetadata } from '@nestjs/common';
import { Permission } from '@/domain/role/value-objects/permission.vo';

export const REQUIRE_PERMISSION_KEY = 'require_permission';

export interface RequirePermissionMetadata {
  permission: Permission;
}

export const RequirePermission = (permission: Permission) =>
  SetMetadata<string, RequirePermissionMetadata>(REQUIRE_PERMISSION_KEY, {
    permission,
  });
