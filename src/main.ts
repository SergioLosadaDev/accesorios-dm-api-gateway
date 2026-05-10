import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:4200'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Trace-Id'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
