import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SecurityProxyMiddleware } from './middlewares/security-proxy.middleware';

@Module({})
export class ProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityProxyMiddleware)
      .forRoutes(
        { path: '/api/v1/auth*', method: RequestMethod.ALL },
        { path: '/api/v1/users*', method: RequestMethod.ALL },
        { path: '/api/v1/roles*', method: RequestMethod.ALL },
      );
  }
}
