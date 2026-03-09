import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '@/application/auth/services/jwt.service';
import {
  REQUIRE_SCOPE_KEY,
  RequireScopeMetadata,
} from '@/infrastructure/auth/decorators/require-scope.decorator';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<
      RequireScopeMetadata | undefined
    >(REQUIRE_SCOPE_KEY, [context.getHandler(), context.getClass()]);

    // Route is not scope-protected — allow through
    if (!metadata) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<
        Request & { user: JwtPayload; params: Record<string, string> }
      >();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Access denied: missing user context');
    }

    // OWNER has full implicit access to everything within their tenant
    if (user.isOwner) {
      return true;
    }

    const resourceId = request.params[metadata.paramName];
    if (!resourceId) {
      throw new ForbiddenException(
        `Access denied: could not resolve resource param '${metadata.paramName}'`,
      );
    }

    // Find any assignment that grants access to the requested resource
    const matchingAssignment = user.roleAssignments.find((assignment) => {
      if (assignment.scope.type === 'TENANT') {
        return true; // tenant-scoped staff can access any resource under the tenant
      }
      if (assignment.scope.type !== metadata.scopeType) {
        return false;
      }
      return assignment.scope.resourceIds.includes(resourceId);
    });

    if (!matchingAssignment) {
      throw new ForbiddenException(
        `Access denied: you do not have access to this ${metadata.scopeType.toLowerCase()}`,
      );
    }

    // If a specific permission is required, verify it is present on the matched assignment
    if (
      metadata.permission &&
      !matchingAssignment.permissions.includes(metadata.permission)
    ) {
      throw new ForbiddenException(
        `Access denied: missing permission '${metadata.permission}'`,
      );
    }

    return true;
  }
}
