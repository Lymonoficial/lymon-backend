import { SetMetadata } from '@nestjs/common';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { UserScope } from '@/domain/user/entities/user.entity';

export const REQUIRE_SCOPE_KEY = 'requireScope';

export interface RequireScopeMetadata {
  scopeType: Exclude<UserScope['type'], 'TENANT'>;
  paramName: string;
  permission?: Permission;
}

/**
 * Marks a route as requiring scope-based access control.
 *
 * @param scopeType - The resource type to check ('PROPERTY' | 'UNIT')
 * @param paramName - The route param name that holds the resource ID
 * @param permission - Optional: also require this specific permission on the matched assignment
 *
 * @example
 * @RequireScope('UNIT', 'unitId', Permission.UNIT_EDIT)
 * @Patch(':unitId')
 * updateUnit(...) { ... }
 */
export const RequireScope = (
  scopeType: RequireScopeMetadata['scopeType'],
  paramName: string,
  permission?: Permission,
) =>
  SetMetadata(REQUIRE_SCOPE_KEY, {
    scopeType,
    paramName,
    permission,
  } as RequireScopeMetadata);
