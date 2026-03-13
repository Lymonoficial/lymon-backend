import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${url} - ${res.statusCode} - ${ms}ms`);
      }),
      catchError((err: unknown) => {
        const ms = Date.now() - start;
        const status =
          err instanceof Error && 'status' in err
            ? (err as { status: number }).status
            : 500;
        const message = err instanceof Error ? err.message : 'Unknown error';

        if (status >= 500) {
          this.logger.error(
            `${method} ${url} - ${status} - ${ms}ms | ${message}`,
          );
        } else {
          this.logger.warn(
            `${method} ${url} - ${status} - ${ms}ms | ${message}`,
          );
        }

        return throwError(() => err);
      }),
    );
  }
}
