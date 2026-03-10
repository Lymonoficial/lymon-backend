import { GuestJwtPayload } from '@/application/guest-auth/services/guest-jwt.service';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentGuest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: GuestJwtPayload }>();
    return request.user;
  },
);
