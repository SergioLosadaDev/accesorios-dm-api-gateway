import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import * as jwt from 'jsonwebtoken';
import { AppModule } from './app.module';
import { JsonLoggerService } from './common/logger/json-logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

const PUBLIC_PATH_PREFIXES = ['/api/v1/health', '/api/v1/auth'];

function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (PUBLIC_PATH_PREFIXES.some((p) => req.path.startsWith(p))) {
    return next();
  }
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'Token de acceso requerido.',
      path: req.path,
      timestamp: new Date().toISOString(),
      traceId: req.headers['x-trace-id'] ?? '',
      details: [],
    });
    return;
  }
  const token = authHeader.slice(7);
  const publicKey = (process.env.JWT_PUBLIC_KEY ?? '').replace(/\\n/g, '\n');
  const issuer = process.env.JWT_ISSUER ?? 'accesorios-dm';
  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer,
    }) as jwt.JwtPayload;
    req.headers['x-user-id'] = String(payload['sub'] ?? '');
    req.headers['x-username'] = String(payload['username'] ?? payload['sub'] ?? '');
    const roles: string[] = Array.isArray(payload['roles']) ? payload['roles'] : [];
    req.headers['x-user-roles'] = roles.join(',');
    next();
  } catch (err: unknown) {
    const isExpired = err instanceof jwt.TokenExpiredError;
    res.status(401).json({
      status: 401,
      error: isExpired ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED',
      message: isExpired ? 'El token ha expirado.' : 'Token inválido o ausente.',
      path: req.path,
      timestamp: new Date().toISOString(),
      traceId: req.headers['x-trace-id'] ?? '',
      details: [],
    });
  }
}

async function bootstrap() {
  const logger = new JsonLoggerService();
  // bodyParser: false lets http-proxy-middleware stream raw POST bodies to the backend.
  // The gateway is a pure proxy; it doesn't need to parse request bodies itself.
  const app = await NestFactory.create(AppModule, { logger, bodyParser: false });

  app.use(
    helmet({
      frameguard: { action: 'deny' },
      contentSecurityPolicy: false,
    }),
  );

  // helmet 7+ removed xssFilter; set it explicitly for legacy browser support
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  app.setGlobalPrefix('api/v1');

  app.use(jwtAuthMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:4200'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Trace-Id'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log({ event: 'startup', message: `Gateway running on port ${port}` }, 'Bootstrap');
}

bootstrap();
