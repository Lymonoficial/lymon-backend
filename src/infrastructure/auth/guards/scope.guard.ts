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

    if (!user?.scope) {
      throw new ForbiddenException('Access denied: missing scope');
    }

    // TENANT scope = full access to everything under that tenant
    if (user.scope.type === 'TENANT') {
      return true;
    }

    // Scoped user must match the exact resource type being accessed
    if (user.scope.type !== metadata.scopeType) {
      throw new ForbiddenException(
        `Access denied: your scope (${user.scope.type}) does not allow access to ${metadata.scopeType} resources`,
      );
    }

    // Extract the resource ID from the route params
    const resourceId = request.params[metadata.paramName];
    if (!resourceId) {
      throw new ForbiddenException(
        `Access denied: could not resolve resource param '${metadata.paramName}'`,
      );
    }

    // Check the specific resource is in the user's allowed list
    const hasAccess = user.scope.resourceIds.includes(resourceId);
    if (!hasAccess) {
      throw new ForbiddenException(
        `Access denied: you do not have access to this ${metadata.scopeType.toLowerCase()}`,
      );
    }

    return true;
  }
}
