import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';

@Injectable()
export class InventoryProxyMiddleware implements NestMiddleware {
  private readonly proxy: (req: Request, res: Response, next: NextFunction) => void;

  constructor() {
    const proxyHandler = createProxyMiddleware({
      target: process.env.INVENTORY_SERVICE_URL,
      changeOrigin: true,
      proxyTimeout: 10000,
      on: {
        proxyReq: (proxyReq, req: IncomingMessage) => {
          if (!proxyReq.getHeader('x-trace-id')) {
            proxyReq.setHeader(
              'x-trace-id',
              (req.headers['x-trace-id'] as string | undefined) ?? randomUUID(),
            );
          }
        },
        error: (err: NodeJS.ErrnoException, req: IncomingMessage, res: ServerResponse) => {
          const isTimeout =
            err.code === 'ECONNABORTED' ||
            err.code === 'ETIMEDOUT' ||
            err.message?.includes('timeout');
          const status = isTimeout ? 504 : 502;
          const error = isTimeout ? 'GATEWAY_TIMEOUT' : 'BAD_GATEWAY';
          const message = isTimeout
            ? 'El servicio no respondió a tiempo. Intente de nuevo.'
            : 'El servicio no está disponible temporalmente. Intente de nuevo.';

          const traceId =
            (req.headers['x-trace-id'] as string | undefined) ?? randomUUID();
          const body = JSON.stringify({
            status,
            error,
            message,
            path: (req as Request).url,
            timestamp: new Date().toISOString(),
            traceId,
            details: [],
          });

          res.writeHead(status, {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          });
          res.end(body);
        },
      },
    });

    this.proxy = proxyHandler as unknown as (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => void;
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.proxy(req, res, next);
  }
}
