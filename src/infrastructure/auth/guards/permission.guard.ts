import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '@/application/auth/services/jwt.service';
import {
  REQUIRE_PERMISSION_KEY,
  type RequirePermissionMetadata,
} from '@/infrastructure/auth/decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<
      RequirePermissionMetadata | undefined
    >(REQUIRE_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!metadata) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Access denied: missing user context');
    }

    // OWNER has implicit access to all permissions
    if (user.isOwner) {
      return true;
    }

    const hasPermission = user.roleAssignments.some((assignment) =>
      assignment.permissions.includes(metadata.permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied: missing permission '${metadata.permission}'`,
      );
    }

    return true;
  }
}
