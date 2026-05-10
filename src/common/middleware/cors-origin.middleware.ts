import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorsOriginMiddleware implements NestMiddleware {
  private readonly allowedOrigins: string[];

  constructor(private readonly config: ConfigService) {
    const raw = this.config.get<string>('ALLOWED_ORIGINS') ?? 'http://localhost:4200';
    this.allowedOrigins = raw.split(',').map((o) => o.trim());
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers['origin'] as string | undefined;

    if (origin && !this.allowedOrigins.includes(origin)) {
      const traceId = (req.headers['x-trace-id'] as string) ?? randomUUID();
      res.status(403).json({
        status: 403,
        error: 'FORBIDDEN',
        message: 'Origen no permitido por la política CORS.',
        path: req.url,
        timestamp: new Date().toISOString(),
        traceId,
        details: [],
      });
      return;
    }

    next();
  }
}
