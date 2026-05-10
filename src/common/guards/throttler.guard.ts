import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.path.startsWith('/api/v1/health')) return true;
    return super.canActivate(context);
  }

  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const forwarded = req['headers'] as Record<string, string | string[]>;
    const xff = forwarded?.['x-forwarded-for'];
    const ip = typeof xff === 'string' ? xff.split(',')[0].trim() : (req['ip'] as string);
    return ip ?? 'unknown';
  }

  protected async throwThrottlingException(
    _context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const retryAfter = Math.ceil(throttlerLimitDetail.timeToExpire / 1000);
    throw new HttpException(
      {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas peticiones. Por favor intente de nuevo más tarde.',
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
