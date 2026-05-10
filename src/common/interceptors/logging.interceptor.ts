import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const traceId = (req.headers['x-trace-id'] as string) ?? randomUUID();
    req.headers['x-trace-id'] = traceId;
    res.setHeader('X-Trace-Id', traceId);

    const start = Date.now();

    this.logger.log(
      JSON.stringify({
        event: 'request',
        traceId,
        method: req.method,
        path: req.url,
        ip: req.ip,
      }),
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            event: 'response',
            traceId,
            method: req.method,
            path: req.url,
            statusCode: res.statusCode,
            responseTimeMs: Date.now() - start,
          }),
        );
      }),
    );
  }
}
