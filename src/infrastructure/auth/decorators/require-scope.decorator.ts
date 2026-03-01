import { SetMetadata } from '@nestjs/common';
import { UserScope } from '@/domain/user/entities/user.entity';

export const REQUIRE_SCOPE_KEY = 'requireScope';

export interface RequireScopeMetadata {
  scopeType: Exclude<UserScope['type'], 'TENANT'>;
  paramName: string;
}

/**
 * Marks a route as requiring scope-based access control.
 *
 * @param scopeType - The resource type to check ('PROPERTY' | 'UNIT')
 * @param paramName - The route param name that holds the resource ID (e.g. 'unitId', 'propertyId')
 *
 * @example
 * @RequireScope('UNIT', 'unitId')
 * @Get(':unitId')
 * getUnit(@Param('unitId') unitId: string) { ... }
 */
export const RequireScope = (
  scopeType: RequireScopeMetadata['scopeType'],
  paramName: string,
) =>
  SetMetadata(REQUIRE_SCOPE_KEY, {
    scopeType,
    paramName,
  } as RequireScopeMetadata);
