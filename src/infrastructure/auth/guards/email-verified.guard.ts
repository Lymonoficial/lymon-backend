import { JwtPayload } from '@/application/auth/services/jwt.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    const user = request.user;

    if (!user?.emailVerified) {
      throw new ForbiddenException(
        'Please verify your email before accessing this resource.',
      );
    }

    return true;
  }
}
